import * as THREE from "three";

export const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),  // Grundfarbe weiß
    transparent: true,                 // Aktiviert Transparenz
    opacity: 0.2,                     // Sehr transparent
    roughness: 0,                     // Sehr glatt
    metalness: 0,                     // Kein metallischer Effekt
    transmission: 0.98,               // Sehr hohe Lichtdurchlässigkeit
    thickness: 0.5,                   // Materialdicke
    envMapIntensity: 1,              // Stärke der Umgebungsreflexionen
    clearcoat: 1,                     // Maximale clearcoat-Schicht
    clearcoatRoughness: 0,            // Glatte clearcoat-Schicht
    ior: 1.52,                        // Brechungsindex für Glas (1.52 ist typisch)
    reflectivity: 0.9,                // Hohe Reflektivität
    side: THREE.DoubleSide            // Render beide Seiten
});

export const tintedGlassMaterial = new THREE.MeshPhysicalMaterial({
    ...glassMaterial,
    color: new THREE.Color(0x88ccff),  // Bläuliche Tönung
    transmission: 0.9,
    opacity: 0.3
});

export const frostedGlassMaterial = new THREE.MeshPhysicalMaterial({
    ...glassMaterial,
    roughness: 0.25,
    transmission: 0.8,
    opacity: 0.4
});