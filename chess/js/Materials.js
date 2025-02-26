class Materials {
    constructor() {
        this.materials = {
            wood: {
                board: {
                    light: new THREE.MeshStandardMaterial({
                        color: 0xe8c39c,
                        roughness: 0.7,
                        metalness: 0.1
                    }),
                    dark: new THREE.MeshStandardMaterial({
                        color: 0x8b4513,
                        roughness: 0.7,
                        metalness: 0.1
                    })
                },
                pieces: {
                    white: new THREE.MeshStandardMaterial({
                        color: 0xf0d9b5,
                        roughness: 0.7,
                        metalness: 0.1
                    }),
                    black: new THREE.MeshStandardMaterial({
                        color: 0x946f51,
                        roughness: 0.7,
                        metalness: 0.1
                    })
                }
            },
            metal: {
                board: {
                    light: new THREE.MeshStandardMaterial({
                        color: 0xcccccc,
                        roughness: 0.2,
                        metalness: 0.8
                    }),
                    dark: new THREE.MeshStandardMaterial({
                        color: 0x666666,
                        roughness: 0.2,
                        metalness: 0.8
                    })
                },
                pieces: {
                    white: new THREE.MeshStandardMaterial({
                        color: 0xdddddd,
                        roughness: 0.2,
                        metalness: 0.8
                    }),
                    black: new THREE.MeshStandardMaterial({
                        color: 0x333333,
                        roughness: 0.2,
                        metalness: 0.8
                    })
                }
            },
            plastic: {
                board: {
                    light: new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.5,
                        metalness: 0.0
                    }),
                    dark: new THREE.MeshStandardMaterial({
                        color: 0x222222,
                        roughness: 0.5,
                        metalness: 0.0
                    })
                },
                pieces: {
                    white: new THREE.MeshStandardMaterial({
                        color: 0xeeeeee,
                        roughness: 0.5,
                        metalness: 0.0
                    }),
                    black: new THREE.MeshStandardMaterial({
                        color: 0x111111,
                        roughness: 0.5,
                        metalness: 0.0
                    })
                }
            }
        };
    }

    getMaterial(type, component, color) {
        return this.materials[type][component][color].clone();
    }

    setMaterialType(objects, type) {
        objects.forEach(obj => {
            if (obj.userData.materialInfo) {
                const { component, color } = obj.userData.materialInfo;
                obj.material = this.getMaterial(type, component, color);
            }
        });
    }
}
