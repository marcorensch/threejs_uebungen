import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

const loader = new GLTFLoader();
import {rotationHelper} from "./utils.js";
import {DecalGeometry} from "three/addons/geometries/DecalGeometry";

export class Helmet {

    logoTexture;
    position;
    rotation;
    color;
    texture;
    isLogoFacingRight;
    shouldMirrorLogo;

    constructor(logoTexture = "", color = new THREE.Color(0xffffff), position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0), isLogoFacingRight = false, shouldMirrorLogo = false) {
        this.logoTexture = logoTexture;
        this.position = position;
        this.rotation = rotation;
        this.color = color;
        this.texture = null;
        this.isLogoFacingRight = true;
        this.shouldMirrorLogo = false;
    }

    /**
     *
     * @param pos       object          {x,y,z} coordinates unit based for placement in the scene
     * @param rot       object          {x:radiant, y:radiant, z:radiant}
     * @param color     THREE.color     like: THREE.Color(0xffffff)
     * @param texture   THREE.texture   generated via TextureLoader
     * @param isLogoFacingRight bool    True if the Logo image shows to the right
     * @param shouldMirrorLogo  bool    True if the Logo should be mirrored on the opposite side of the helmet
     */
    generate() {
        return new Promise(async (resolve, reject) => {

            // Texturen vorladen
            const metalStrapsTexture = await this.#safeLoadTexture('../models/helmet/helmetFootball_metalStraps_baseColor.png');
            const strapTexture = await this.#safeLoadTexture('../models/helmet/helmetFootball_strap_baseColor.png');

            loader.load(
                './models/helmet/helmetFootball.glb',  // Passen Sie den Pfad entsprechend an
                (gltf) => {
                    const model = gltf.scene.children[0];

                    if (this.logoTexture) {
                        this.#createDecals(model);
                    }

                    console.log(model)

                    model.traverse((node) => {
                        if (node.isMesh) {
                            if (node.name === 'helmetFootball_metalStraps') {
                                node.material = new THREE.MeshPhysicalMaterial({
                                    color: new THREE.Color(0x696969),
                                    metalness: 0,
                                    roughness: 0,
                                    envMapIntensity: 1,
                                    clearcoat: 0.9,
                                });
                            } else if (node.name === 'helmetFootball_strap') {
                                node.material.map = strapTexture;
                                node.material.needsUpdate = true;
                            } else if (node.name === 'helmetFootball_insideBumpers' || node.name === 'helmetFootball_neckSupport') {
                                node.material = new THREE.MeshPhysicalMaterial({
                                    color: new THREE.Color(0x131313),
                                    metalness: 0,
                                    roughness: 0.9,
                                    envMapIntensity: 0.3,  // Reduzierte Umgebungsreflexionen
                                    clearcoat: 0.1,   // Leichter Clearcoat für subtilen Glanz
                                    clearcoatRoughness: 0.8  // Rauer Clearcoat für weniger scharfe Reflexionen

                                });
                                node.material.needsUpdate = true;
                            } else if (node.name === 'helmetFootball_frontFrame') {
                                node.material = new THREE.MeshPhysicalMaterial({
                                    color: new THREE.Color(0x333333),
                                    metalness: 1,
                                    roughness: 0,
                                });
                                node.material.needsUpdate = true;
                            } else if (node.name === 'helmetFootball_helmetShell' || node.name === 'helmetFootball_airValves') {
                                const originalMaterial = node.material;
                                Object.assign(originalMaterial, {
                                    color: this.color,
                                    metalness: 0,
                                    roughness: 0.2,
                                    clearcoat: 0.5
                                });
                                node.material.needsUpdate = true;
                            } else if (node.name === 'helmetFootball_chinProtector') {
                                const originalMaterial = node.material;
                                Object.assign(originalMaterial, {
                                    color: new THREE.Color(0xd9d9d9),
                                    metalness: 0,
                                    roughness: 0.1,
                                    clearcoat: 0.5
                                });

                                node.material.needsUpdate = true;
                            } else if (node.name === 'helmetFootball_plasticConsole') {

                                node.material = new THREE.MeshPhysicalMaterial({
                                    color: new THREE.Color(0xffffff),  // Grundfarbe weiß
                                    transparent: true,                 // Aktiviert Transparenz
                                    opacity: 0.8,                     // Transparenz-Level (0 = unsichtbar, 1 = solid)
                                    roughness: 0.1,                   // Niedrige Rauheit für glänzende Oberfläche
                                    metalness: 0,                     // Kein metallischer Effekt
                                    transmission: 0.9,                // Lichtdurchlässigkeit
                                    thickness: 0.5,                   // Materialdicke für Lichtbrechung
                                    clearcoat: 1.0,                   // Zusätzliche glänzende Schicht
                                    clearcoatRoughness: 0.1,          // Rauheit der Clearcoat-Schicht
                                    ior: 1.5                          // Brechungsindex (typisch für Plastik)
                                });

                                node.material.needsUpdate = true;
                            }

                            // Schatten aktivieren
                            node.castShadow = true;
                            node.receiveShadow = true;

                            // Geometrie-Optimierung
                            node.geometry.attributes.position.needsUpdate = false;
                        }
                    });


                    // Optional: Position anpassen
                    model.position.set(this.position.x, this.position.y, this.position.z);

                    // Rotation anpassen (falls nötig)
                    model.rotation.set(
                        this.rotation.x,
                        this.rotation.y,
                        this.rotation.z
                    );

                    model.updateMatrix();
                    model.updateMatrixWorld(true); // Erzwingt vollständige Matrixaktualisierung nach rotation


                    resolve(model);
                },
                // Ladefortschritt
                (progress) => {
                    console.log('Lade: ', (progress.loaded / progress.total * 100) + '%');
                },
                // Fehlerbehandlung
                (error) => {
                    console.error('Fehler beim Laden des Modells:', error);
                    reject(error);
                }
            );
        });
    }

    #createDecal(targetNode, xPosition, texture) {

        // Projektionsposition
        const decalPosition = new THREE.Vector3(
            xPosition,
            (targetNode.geometry.boundingBox.min.y + targetNode.geometry.boundingBox.max.y) / 2 + 5,
            0
        );

        // Decalgröße definieren
        const decalSize = new THREE.Vector3(
            8, 8, 8
        );

        // Helfer zur Viasualisierung der Position
        const helperBox = new THREE.Mesh(
            new THREE.BoxGeometry(8, 8, 8), // Größe der Hilfsbox (x, y, z)
            new THREE.MeshBasicMaterial({
                color: 0x00ff00, // Grüne Farbe
                wireframe: true  // Nur Drahtgitter-Ansicht
            })
        );
        helperBox.position.copy(decalPosition);
        targetNode.add(helperBox);

        console.log("DecalPosition: ", decalPosition)

        // Rotation für Projektion
        const decalOrientation = new THREE.Euler(
            0,  // X-Rotation
            rotationHelper(90),  // Y-Rotation
            0   // Z-Rotation
        );

        // Decal-Geometrie erstellen
        const decalGeometry = new DecalGeometry(
            targetNode,        // Zielmesh
            decalPosition,
            decalOrientation,// Rotationsvektor
            decalSize          // Größe des Decals
        );

        // Decal-Material
        const decalMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.FrontSide,  // Nur Vorderseite rendern

            depthTest: true,         // Tiefentest wieder aktivieren
            depthWrite: true,        // Tiefenschreiben aktivieren

            blending: THREE.NormalBlending,

            // Zusätzliche Optimierung
            // precision: 'highp',      // Höhere Rendergenauigkeit
            // polygonOffset: true,     // Leichte Verschiebung zur Vermeidung von Z-Fighting
            // polygonOffsetFactor: -1,
            // polygonOffsetUnits: -1

        });

        // Decal-Mesh erstellen
        return new THREE.Mesh(decalGeometry, decalMaterial);
    }

    async #createDecals(model) {

        const texture = await this.#safeLoadTexture(this.logoTexture);
        if (!texture) {
            console.log("No Logo Texture found")
            return;
        }

        const targetNode = model.getObjectByName('helmetFootball_4');

        if (!targetNode) {
            console.log("No target for decal found")
        }

        const boundingBox = targetNode.geometry.boundingBox;

        const boundingBoxHelper = new THREE.Box3Helper(boundingBox, 0xff0000); // Rot als Farbe
        targetNode.add(boundingBoxHelper);

        // Decal-Parameter
        const decalSize = new THREE.Vector3(8, 8, 8); // Anpassen je nach Logogröße
        const decalOrientation = new THREE.Euler(0, rotationHelper(90), 0);
        const yPosition = (targetNode.geometry.boundingBox.min.y + targetNode.geometry.boundingBox.max.y) / 2 + 5;


        // Decal-Positionen (links und rechts)
        const decalPositions = [
            new THREE.Vector3(targetNode.geometry.boundingBox.max.x, yPosition, 0),
            new THREE.Vector3(targetNode.geometry.boundingBox.min.x, yPosition, 0)
        ];


        decalPositions.forEach((position, index) => {

            // Helfer zur Viasualisierung der Position
            const helperBox = new THREE.Mesh(
                new THREE.BoxGeometry(8, 8, 8), // Größe der Hilfsbox (x, y, z)
                new THREE.MeshBasicMaterial({
                    color: 0x00ff00, // Grüne Farbe
                    wireframe: true  // Nur Drahtgitter-Ansicht
                })
            );
            helperBox.position.copy(position);
            targetNode.add(helperBox);

            // Decal-Geometrie erstellen
            const decalGeometry = new DecalGeometry(
                targetNode,
                position,
                decalOrientation,
                decalSize
            );

            // Decal-Material
            const decalMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthTest: true,
                opacity: 1
            });

            // Decal-Mesh erstellen
            const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);

            // Zum Ziel-Mesh hinzufügen
            targetNode.add(decalMesh);
        });
    }

    #safeLoadTexture(path) {
        return new Promise((resolve, reject) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                path,
                (texture) => resolve(texture),
                undefined, // onProgress
                (error) => {
                    console.warn(`Texture not found: ${path}`, error);
                    // Fallback-Textur oder null zurückgeben
                    resolve(null);
                }
            );
        });
    };
}
