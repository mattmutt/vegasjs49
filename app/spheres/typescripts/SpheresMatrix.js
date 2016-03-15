var vegasjs;
(function (vegasjs) {
    var demo1;
    (function (demo1) {
        // ======== main class definition ========
        var SpheresMatrix = (function () {
            function SpheresMatrix() {
                var _this = this;
                this.objects = []; // container
                //actual drawing - optimized as enclosed callback
                // draw-render interactive loop callback
                this.animate = function () {
                    requestAnimationFrame(_this.animate);
                    _this.render();
                };
                // capability check
                if (!Detector.webgl)
                    Detector.addGetWebGLMessage();
            }
            // configure component
            SpheresMatrix.prototype.initialize = function (layoutNodeId) {
                var _this = this;
                this.container = document.getElementById(layoutNodeId);
                this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000);
                this.camera.position.set(40.0, 400, 400 * 2.5);
                this.scene = new THREE.Scene();
                this.renderer = new THREE.WebGLRenderer({ antialias: true });
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
                window.addEventListener('resize', function (event) { return _this.onWindowResize(event); }, false);
            };
            SpheresMatrix.prototype.onLibrariesLoaded = function () {
                // environmental background
                var path = "images/textures/outdoor/";
                var format = '.jpg';
                var urls = [
                    path + 'px' + format, path + 'nx' + format,
                    path + 'py' + format, path + 'ny' + format,
                    path + 'pz' + format, path + 'nz' + format
                ];
                var reflectionCube = new THREE.CubeTextureLoader().load(urls);
                reflectionCube.format = THREE.RGBFormat;
                var cubeWidth = 300;
                var numberOfSphersPerSide = 3;
                var sphereRadius = (cubeWidth / (numberOfSphersPerSide)) * 0.8 * 0.4;
                var stepSize = 1.0 / (numberOfSphersPerSide);
                var geometry = new THREE.SphereBufferGeometry(sphereRadius, 32, 16);
                for (var alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex++) {
                    // alternate reflectivity
                    var localReflectionCube = (alphaIndex % 2 === 0)
                        ? null
                        : reflectionCube;
                    localReflectionCube = reflectionCube;
                    // reflectivity
                    for (var beta = 0; beta <= 1.0; beta += stepSize) {
                        for (var gamma = 0.0; gamma <= 1.0; gamma += stepSize) {
                            // reflect the environment and give the ball some color
                            var diffuseColor = new THREE.Color(gamma, gamma, gamma * .8).multiplyScalar(1 - 0.08);
                            var materialParameters = {
                                color: diffuseColor.getHex(),
                                // REVIEW ====== color change on the spheres
                                //color: "#ff33aa",
                                reflectivity: beta,
                                shading: THREE.SmoothShading,
                                envMap: localReflectionCube
                            };
                            var material = new THREE.MeshBasicMaterial(materialParameters);
                            var mesh = new THREE.Mesh(geometry, material);
                            mesh.position.x = alpha * 400 - 200;
                            mesh.position.y = beta * 400 - 200;
                            mesh.position.z = gamma * 400 - 200;
                            this.objects.push(mesh);
                            this.scene.add(mesh);
                        }
                    }
                }
                // Lights
                var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(0, 0, 1).normalize();
                this.scene.add(directionalLight);
            };
            // recalculate viewport dim
            SpheresMatrix.prototype.onWindowResize = function (event) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            };
            SpheresMatrix.prototype.render = function () {
                var timer = Date.now() * 0.00025;
                this.camera.position.x = Math.cos(timer) * 400;
                this.camera.position.z = Math.sin(timer) * 800;
                this.camera.lookAt(this.scene.position);
                for (var i = 0, l = this.objects.length; i < l; i++) {
                    // REVIEW -- explain cast conversion from THREE.Object3D
                    // similar to Java
                    var object = this.objects[i]; // cast type asserted
                    //object.rotation.y += 0.005;
                    object.position.y = Math.sin(timer * 5) * 100;
                }
                this.renderer.render(this.scene, this.camera);
            };
            return SpheresMatrix;
        })();
        demo1.SpheresMatrix = SpheresMatrix;
    })(demo1 = vegasjs.demo1 || (vegasjs.demo1 = {}));
})(vegasjs || (vegasjs = {}));
//# sourceMappingURL=SpheresMatrix.js.map