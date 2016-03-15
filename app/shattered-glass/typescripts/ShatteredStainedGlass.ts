module vegasjs {

    export module demo2 {


        interface IShatteredStainedGlassShaderMaterial extends THREE.RawShaderMaterial {
            uniforms: { time: {type: string, value: number} },
            vertexShader: string;
            fragmentShader: string;
        }


        interface IShatteredStainedGlassMesh extends THREE.Mesh {
            material : IShatteredStainedGlassShaderMaterial;
        }

        // ======== main class definition ========
        export class ShatteredStainedGlass {

            // UX
            mouseX:number;
            mouseY:number;

            container:HTMLElement;
            camera:THREE.PerspectiveCamera;
            scene:THREE.Scene;
            renderer:THREE.WebGLRenderer;

            constructor() {

                // capability check
                if (!Detector.webgl) Detector.addGetWebGLMessage();

            }


            // configure component
            initialize(layoutNodeId:string) {

                this.container = document.getElementById(layoutNodeId);
                this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10);
                this.camera.position.z = 1.8;

                this.scene = new THREE.Scene();

                // geometry
                const triangles:number = 50;
                const polygonVertices:number = 5;
                const pointCoordinates:number = 3;
                const geometry:THREE.BufferGeometry = new THREE.BufferGeometry();
                const vertices:Float32Array = new Float32Array(triangles * 3 * pointCoordinates);

                for (let i = 0, l = triangles * polygonVertices * pointCoordinates; i < l; i += polygonVertices) {

                    // points for poly
                    for (let j = 0; j < polygonVertices; j++) {
                        vertices[i + j] = Math.random() - 0.5;
                    }

                }
                geometry.addAttribute('position', new THREE.BufferAttribute(vertices, pointCoordinates));


                let colors:Float32Array = new Float32Array(triangles * polygonVertices * 4);
                // over quadruplets
                for (let i = 0, l = triangles * polygonVertices * 4; i < l; i += 4) {

                    colors[i + 0] = Math.random(); // R
                    colors[i + 1] = Math.random(); // G
                    colors[i + 2] = Math.random(); // B
                    colors[i + 3] = Math.random(); // alpha

                }
                geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4));


                // material definition
                let materialMixin = {
                    uniforms: {
                        time: {type: "f", value: 1.0}
                    },
                    // bootstrap hardware code
                    fragmentShader: fragmentShader,
                    vertexShader: vertexShader,
                    side: THREE.DoubleSide,
                    transparent: true
                };

                const material:THREE.RawShaderMaterial = new THREE.RawShaderMaterial(materialMixin);
                const mesh:THREE.Mesh = new THREE.Mesh(geometry, material);

                this.scene.add(mesh);

                this.renderer = new THREE.WebGLRenderer();
                this.renderer.setClearColor(0x101010);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.container.appendChild(this.renderer.domElement);


                // UI reaction coordination
                document.addEventListener('mousemove', this.onDocumentMouseMoveEvent, false);
                window.addEventListener('resize', (event) => this.onWindowResize(event), false);
            }

            // recalculate viewport dim
            onWindowResize(event) {

                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);

            }


            //actual drawing - optimized as enclosed callback
            // draw-render interactive loop callback

            // todo:  -- explain why this type of lamba function was chosen over method. talk about why closures
            // would have been heavier on the CPU when looped over with rAF()

            animate = () => {
                requestAnimationFrame(this.animate);
                this.render();
            };


            render() {
                const time:number = performance.now();

                // casting as a type assertion from Object3D
                // !! using newer "as" syntax const object = this.scene.children[0] as IShatteredStainedGlassMesh;
                const object = <IShatteredStainedGlassMesh>this.scene.children[0];

                // allow mouse to freely rotate this art shape around Y
                let pctMousePosition:number = this.mouseX / this.renderer.getSize().width;
                if ( isNaN(pctMousePosition)){ pctMousePosition=1;};


                // object.rotation.y = time * 0.00031;
                object.rotation.y = time * 0.00031 * (pctMousePosition);
                object.material.uniforms.time.value = time * 0.005;


                this.camera.position.x = 0.1 * Math.sin(time / 1000);
                this.camera.position.y = 0.2 * Math.sin(time / 1000);
                this.camera.lookAt(this.scene.position);

                this.renderer.render(this.scene, this.camera);
            }


            // observe gesture / mouse callback
            onDocumentMouseMoveEvent = (event) => {

                const windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;

                this.mouseX = event.clientX - windowHalfX; // 0-based center
                this.mouseY = event.clientY - windowHalfY;

            }


        }


        // hardware graphics programming

        const fragmentShader:string = /* GPU code */
            `
			precision mediump float;
			precision mediump int;

			uniform float time;

			varying vec3 vPosition;
			varying vec4 vColor;

			void main()	{

				vec4 color = vec4( vColor );
				// orangish tint
				color.r += .4;
				//color.r += sin( vPosition.x * 10.0 + time ) * 0.5;
				color.g -= .1;
				color.b -= .2;
				gl_FragColor = color;

			}
            `;

        const vertexShader:string = /* GPU code */
            `
			precision mediump float;
			precision mediump int;

			uniform mat4 modelViewMatrix; // optional
			uniform mat4 projectionMatrix; // optional

			attribute vec3 position;
			attribute vec4 color;

			varying vec3 vPosition;
			varying vec4 vColor;

			void main()	{

				vPosition = position;
				vColor = color;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}
			`;

    }

}
