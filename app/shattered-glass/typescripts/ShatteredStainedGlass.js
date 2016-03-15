var vegasjs;
(function (vegasjs) {
    var demo2;
    (function (demo2) {
        // ======== main class definition ========
        var ShatteredStainedGlass = (function () {
            function ShatteredStainedGlass() {
                var _this = this;
                //actual drawing - optimized as enclosed callback
                // draw-render interactive loop callback
                // todo:  -- explain why this type of lamba function was chosen over method. talk about why closures
                // would have been heavier on the CPU when looped over with rAF()
                this.animate = function () {
                    requestAnimationFrame(_this.animate);
                    _this.render();
                };
                // observe gesture / mouse callback
                this.onDocumentMouseMoveEvent = function (event) {
                    var windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;
                    _this.mouseX = event.clientX - windowHalfX; // 0-based center
                    _this.mouseY = event.clientY - windowHalfY;
                };
                // capability check
                if (!Detector.webgl)
                    Detector.addGetWebGLMessage();
            }
            // configure component
            ShatteredStainedGlass.prototype.initialize = function (layoutNodeId) {
                var _this = this;
                this.container = document.getElementById(layoutNodeId);
                this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10);
                this.camera.position.z = 1.8;
                this.scene = new THREE.Scene();
                // geometry
                var triangles = 50;
                var polygonVertices = 5;
                var pointCoordinates = 3;
                var geometry = new THREE.BufferGeometry();
                var vertices = new Float32Array(triangles * 3 * pointCoordinates);
                for (var i = 0, l = triangles * polygonVertices * pointCoordinates; i < l; i += polygonVertices) {
                    // points for poly
                    for (var j = 0; j < polygonVertices; j++) {
                        vertices[i + j] = Math.random() - 0.5;
                    }
                }
                geometry.addAttribute('position', new THREE.BufferAttribute(vertices, pointCoordinates));
                var colors = new Float32Array(triangles * polygonVertices * 4);
                // over quadruplets
                for (var i = 0, l = triangles * polygonVertices * 4; i < l; i += 4) {
                    colors[i + 0] = Math.random(); // R
                    colors[i + 1] = Math.random(); // G
                    colors[i + 2] = Math.random(); // B
                    colors[i + 3] = Math.random(); // alpha
                }
                geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4));
                // material definition
                var materialMixin = {
                    uniforms: {
                        time: { type: "f", value: 1.0 }
                    },
                    // bootstrap hardware code
                    fragmentShader: fragmentShader,
                    vertexShader: vertexShader,
                    side: THREE.DoubleSide,
                    transparent: true
                };
                var material = new THREE.RawShaderMaterial(materialMixin);
                var mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);
                this.renderer = new THREE.WebGLRenderer();
                this.renderer.setClearColor(0x101010);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.container.appendChild(this.renderer.domElement);
                // UI reaction coordination
                document.addEventListener('mousemove', this.onDocumentMouseMoveEvent, false);
                window.addEventListener('resize', function (event) { return _this.onWindowResize(event); }, false);
            };
            // recalculate viewport dim
            ShatteredStainedGlass.prototype.onWindowResize = function (event) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            };
            ShatteredStainedGlass.prototype.render = function () {
                var time = performance.now();
                // casting as a type assertion from Object3D
                // !! using newer "as" syntax const object = this.scene.children[0] as IShatteredStainedGlassMesh;
                var object = this.scene.children[0];
                // allow mouse to freely rotate this art shape around Y
                var pctMousePosition = this.mouseX / this.renderer.getSize().width;
                if (isNaN(pctMousePosition)) {
                    pctMousePosition = 1;
                }
                ;
                // object.rotation.y = time * 0.00031;
                object.rotation.y = time * 0.00031 * (pctMousePosition);
                object.material.uniforms.time.value = time * 0.005;
                this.camera.position.x = 0.1 * Math.sin(time / 1000);
                this.camera.position.y = 0.2 * Math.sin(time / 1000);
                this.camera.lookAt(this.scene.position);
                this.renderer.render(this.scene, this.camera);
            };
            return ShatteredStainedGlass;
        })();
        demo2.ShatteredStainedGlass = ShatteredStainedGlass;
        // hardware graphics programming
        var fragmentShader = "\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tuniform float time;\n\n\t\t\tvarying vec3 vPosition;\n\t\t\tvarying vec4 vColor;\n\n\t\t\tvoid main()\t{\n\n\t\t\t\tvec4 color = vec4( vColor );\n\t\t\t\t// orangish tint\n\t\t\t\tcolor.r += .4;\n\t\t\t\t//color.r += sin( vPosition.x * 10.0 + time ) * 0.5;\n\t\t\t\tcolor.g -= .1;\n\t\t\t\tcolor.b -= .2;\n\t\t\t\tgl_FragColor = color;\n\n\t\t\t}\n            ";
        var vertexShader = "\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tuniform mat4 modelViewMatrix; // optional\n\t\t\tuniform mat4 projectionMatrix; // optional\n\n\t\t\tattribute vec3 position;\n\t\t\tattribute vec4 color;\n\n\t\t\tvarying vec3 vPosition;\n\t\t\tvarying vec4 vColor;\n\n\t\t\tvoid main()\t{\n\n\t\t\t\tvPosition = position;\n\t\t\t\tvColor = color;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t\t}\n\t\t\t";
    })(demo2 = vegasjs.demo2 || (vegasjs.demo2 = {}));
})(vegasjs || (vegasjs = {}));
//# sourceMappingURL=ShatteredStainedGlass.js.map