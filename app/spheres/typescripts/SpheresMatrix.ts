module vegasjs {

    export module demo1 {

        // ======== main class definition ========
        export class SpheresMatrix {

            container:HTMLElement;
            camera:THREE.PerspectiveCamera;
            scene:THREE.Scene;
            renderer:THREE.WebGLRenderer;

            objects:Array<THREE.Object3D> = []; // container

            constructor() {

                // capability check
                if (!Detector.webgl) Detector.addGetWebGLMessage();

            }


            // configure component
            initialize(layoutNodeId:string) {

                this.container = document.getElementById(layoutNodeId);

                this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000);
                this.camera.position.set(40.0, 400, 400 * 2.5);

                this.scene = new THREE.Scene();

                this.renderer = new THREE.WebGLRenderer({antialias: true});
                this.renderer.setClearColor(0x0a0a0a);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.sortObjects = true;


                this.renderer.gammaInput = true;
                this.renderer.gammaOutput = true;


                // place CANVAS
                this.container.appendChild(this.renderer.domElement);

                // after all the dependencies are provisioned, do some extra setup
                this.onLibrariesLoaded();

                // UI reaction coordination
                window.addEventListener('resize', (event) => this.onWindowResize(event), false);
            }


            onLibrariesLoaded() {

                // environmental background
                const path = "images/textures/outdoor/";
                const format = '.jpg';
                const urls = [
                    path + 'px' + format, path + 'nx' + format,
                    path + 'py' + format, path + 'ny' + format,
                    path + 'pz' + format, path + 'nz' + format
                ];

                const reflectionCube:THREE.CubeTexture = new THREE.CubeTextureLoader().load(urls);
                reflectionCube.format = THREE.RGBFormat;

                const cubeWidth:number = 300;
                const numberOfSphersPerSide:number = 3;
                const sphereRadius:number = ( cubeWidth / (numberOfSphersPerSide ) ) * 0.8 * 0.4;
                const stepSize:number = 1.0 / (numberOfSphersPerSide );

                const geometry:THREE.SphereBufferGeometry = new THREE.SphereBufferGeometry(sphereRadius, 32, 16);


                for (let alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex++) {

                    // alternate reflectivity
                    let localReflectionCube = (alphaIndex % 2 === 0)
                        ? null
                        : reflectionCube;

                    localReflectionCube = reflectionCube;

                    // reflectivity
                    for (let beta = 0; beta <= 1.0; beta += stepSize) {

                        for (let gamma = 0.0; gamma <= 1.0; gamma += stepSize) {

                            // reflect the environment and give the ball some color
                            const diffuseColor:THREE.Color = new THREE.Color(gamma, gamma, gamma * .8).multiplyScalar(1 - 0.08);

                            let materialParameters:THREE.MeshBasicMaterialParameters = {
                                color: diffuseColor.getHex(),
                                // REVIEW ====== color change on the spheres
                                //color: "#ff33aa",
                                reflectivity: beta,
                                shading: THREE.SmoothShading,
                                envMap: localReflectionCube
                            };

                            let material = new THREE.MeshBasicMaterial(materialParameters);

                            const mesh = new THREE.Mesh(geometry, material);

                            mesh.position.x = alpha * 400 - 200;
                            mesh.position.y = beta * 400 - 200;
                            mesh.position.z = gamma * 400 - 200;

                            this.objects.push(mesh);
                            this.scene.add(mesh);
                        }
                    }

                    // /end loop
                }

                // Lights
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(0, 0, 1).normalize();
                this.scene.add(directionalLight);

            }

            // recalculate viewport dim
            onWindowResize(event) {

                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);

            }


            //actual drawing - optimized as enclosed callback
            // draw-render interactive loop callback
            animate = () => {
                requestAnimationFrame(this.animate);
                this.render();
            };


            render() {

                const timer = Date.now() * 0.00025;

                this.camera.position.x = Math.cos(timer) * 400;
                this.camera.position.z = Math.sin(timer) * 800;

                this.camera.lookAt(this.scene.position);

                for (let i = 0, l = this.objects.length; i < l; i++) {

                    // REVIEW -- explain cast conversion from THREE.Object3D
                    // similar to Java
                    const object = <THREE.Mesh>this.objects[i]; // cast type asserted

                    //object.rotation.y += 0.005;
                    object.position.y = Math.sin(timer * 5) * 100;
                    //object.position.y = Math.sin(timer * 5) * 800;
                }

                this.renderer.render(this.scene, this.camera);

            }

        }


    }

}
