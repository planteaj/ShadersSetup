// Read/Do:
//  Dusan Bosnjak (triangles)
//      https://medium.com/@pailhead011/writing-glsl-with-three-js-part-1-1acb1de77e5c
//      https://medium.com/@pailhead011/extending-three-js-materials-with-glsl-78ea7bbb9270
//
//  Basic (step by step includes set-up)
//      https://pandaqitutorials.com/Games/9-three-js-complete-glsl-tutorial
//
//  A bit random but still OK (jump to the shader section)
//      https://dev.to/maniflames/creating-a-custom-shader-in-threejs-3bhi
//      (we will fix and work with this one)

//
//  CJ Gammon -- Shader Tutorial Nice video with nice results:
//      https://www.youtube.com/watch?v=uD4GnMsAH1U&t=522s
//
//  later more in-depth:
//      https://thebookofshaders.com/
//  debugging hints:
//      https://threejsfundamentals.org/threejs/lessons/threejs-debugging-glsl.html
//
// Here we are doing partly
// https://pandaqitutorials.com/Games/9-three-js-complete-glsl-tutorial
//


import * as THREE from          'https://unpkg.com/three@0.120.0/build/three.module.js';
import { OrbitControls } from   'https://unpkg.com/three@0.120.0/examples/jsm/controls/OrbitControls.js';
import { GUI }           from 'https://unpkg.com/three@0.120.0/examples/jsm/libs/dat.gui.module.js';
import { TeapotBufferGeometry } from   'https://unpkg.com/three@0.120.0/examples/jsm/geometries/TeapotBufferGeometry.js';

let controls = [];      // array of instances from a class (new in javascript)
let gui;

let scene;
let camera;
let renderer;
let sceneObjects = [];
let teapotObjects = [];

let uniforms = {};
let cameraControls ;

let ambientLight;
let light;
let pointLight;
let scale=2;

let textureMap;
let a = new THREE.Vector3(.0,.0,.0);
let b = new THREE.Vector3(0.0, 0.0, 0.0);
let c = new THREE.Vector3(0.0, 0.0, 0.0);
let Ateapot;
let Bteapot;
let thematerials = [];

let shadingAlgorithm = [
    {
    WireFrame:  0,  /**/
    Flat:       1,
    Normal:     2,      /* OK */
    Glow:       3,      /* OK */
    Toon:       4,      /* OK */
    Phong:      5,
    Lambert:    6,
    Gourard:    7,
    Text:       8,

    },
];

let phongOptions = [
    {
        All: 0,
        Ambient: 1,
        Diffuse: 2,
        Specular: 3,
        AD: 4,
        DS: 5,
        AS: 6,

    },
];

let shadingAlgorithmString = [
    'WireFrame',
    'Flat',
    'Normal',
    'Glow',
    'Toon',
    'Phong',

    'Lambert',
    'Gourard',
    'Text',

];

let shading = 0;

function setSomeVariables( value )
{
    console.log("stuff:" + value);
    console.log("stuff:" + shadingAlgorithmString[value] );
    shading = value;
  
    for (let object of teapotObjects) {
        object.material = thematerials[shading];
       }
    
}
function setPhongSettings(value) {
    if (shading == 5) {
        for (let object of teapotObjects) {
            if (value == 0) {
                object.material.uniforms.Ka.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Kd.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Ks.value = new THREE.Vector3(.8, .8, .8);
            }
            else if (value == 1) {
                object.material.uniforms.Ka.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Kd.value = new THREE.Vector3(0, 0, 0, );
                object.material.uniforms.Ks.value = new THREE.Vector3(0.0, 0.0, 0.0);
            } else if (value == 2) {
                object.material.uniforms.Ka.value = new THREE.Vector3(0.0, 0.0, 0.0);
                object.material.uniforms.Kd.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Ks.value = new THREE.Vector3(0.0, 0.0, 0.0);
            } else if (value == 3) {
                object.material.uniforms.Ka.value = new THREE.Vector3(0.0, 0.0, 0.0);
                object.material.uniforms.Kd.value = new THREE.Vector3(0.0, 0.0, 0.0);
                object.material.uniforms.Ks.value = new THREE.Vector3(.8, .8, .8);
            } else if (value == 4) {
                object.material.uniforms.Ka.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Kd.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Ks.value = new THREE.Vector3(0.0, 0.0, 0.0);
            } else if (value == 5) {
                object.material.uniforms.Ka.value = new THREE.Vector3(0.0, 0.0, 0.0);
                object.material.uniforms.Kd.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Ks.value = new THREE.Vector3(.8, .8, .8);
            } else if (value == 6) {
                object.material.uniforms.Ka.value = new THREE.Vector3(.9, .5, .3);
                object.material.uniforms.Kd.value = new THREE.Vector3(0.0, 0.0, 0.0);
                object.material.uniforms.Ks.value = new THREE.Vector3(.8, .8, .8);
            }
        }
    }
}

function addControls( controlObject )
{
    gui = new GUI();
    gui.add(controlObject, 'rotationSpeed', -0.01, 0.01).step(0.01);
    gui.add(controlObject, 'scale', 0, 2).step(0.1);
    gui.add(controlObject, 'Shader', shadingAlgorithm[0]).onChange(setSomeVariables);
    gui.add(controlObject, 'PhongSettings', phongOptions[0]).onChange(setPhongSettings);
   }




// using the code as a string from  app.html --
function addTheeJSTeapot()  // comparison teapot using library routines
{
    console.log("when does this run");


    let nvShader = document.getElementById('normalVertexShader').innerHTML;
    let nfShader = document.getElementById('normalFragmentShader').innerHTML;

    let mvShader = document.getElementById('myVertexShader').innerHTML;
    let mfShader = document.getElementById('myFragmentShader').innerHTML;

    let pvShader = document.getElementById('teapotVertexShader').innerHTML;
    let pfShader = document.getElementById('teapotFragmentShader').innerHTML;

    let tvShader = document.getElementById('toonVertexShader').innerHTML;
    let tfShader = document.getElementById('toonFragmentShader').innerHTML;

    let gvShader = glowvShader();
    let gfShader = glowfShader();

    let teapotSize  = 1*scale;
    let tess        = -1;	// force initialization

    let materialColor = new THREE.Color();
    materialColor.setRGB( 1.0, 0.8, 0.6 );

    // TEXTURE MAP
    textureMap = new THREE.TextureLoader().load( 'textures/uv_grid_opengl.jpg' );
    textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
    textureMap.anisotropy = 16;
    textureMap.encoding = THREE.sRGBEncoding;

    // REFLECTION MAP
    let path = "textures/cube/pisa/";
    let urls = [
        path + "px.png", path + "nx.png",
        path + "py.png", path + "ny.png",
        path + "pz.png", path + "nz.png"
    ];

    let textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.encoding = THREE.sRGBEncoding;

    const teapotGeometry = new TeapotBufferGeometry(
        teapotSize,
        tess,
        true,
        true,
        true,
        true
    );

    

    let wireMaterial        = new THREE.MeshBasicMaterial( { color: 0x7777ff, wireframe: true } ) ;
    thematerials.push(wireMaterial);

    let flatMaterial        = new THREE.MeshPhongMaterial( { color: materialColor, specular: 0x000000, flatShading: true, side: THREE.DoubleSide } );
    thematerials.push(flatMaterial);

    let normalMaterial = new THREE.ShaderMaterial({
        vertexShader: nvShader,
        fragmentShader: nfShader,
    });
    thematerials.push(normalMaterial);

    //let glowMaterial  = new THREE.MeshPhongMaterial( { color: materialColor, envMap: textureCube, side: THREE.DoubleSide } );

    let glowMaterial = new THREE.ShaderMaterial({
        uniforms:
        {
            MatColor: {value: new THREE.Vector3(0.0, 0.0, 0.0) },
            GlowColor: { value: new THREE.Vector3(1, 1, 1)
        }
        },
        vertexShader: gvShader,
        fragmentShader: gfShader,
    });
    thematerials.push(glowMaterial);

    //let toonMaterial       = new THREE.MeshToonMaterial( { color: 0x7777ff  } );
   // let toonMaterial = new THREE.MeshToonMaterial({ color: 0x7777ff });
    let toonMaterial = new THREE.ShaderMaterial({
        uniforms:
        {
            ToonColor: { value: new THREE.Vector3(0.8, 0.2, 0.0) },
            lightDirection: {value: pointLight.position}
        },
        vertexShader: tvShader,
        fragmentShader: tfShader,
    });
    thematerials.push(toonMaterial);

    //let phongMaterial = new THREE.MeshPhongMaterial({ color: materialColor, side: THREE.DoubleSide });
    let phongMaterial = new THREE.ShaderMaterial({
        //Optional, here you can supply uniforms and attributes
        uniforms:
        {
            //  Ka: { value: new THREE.Vector3(0.9, 0.5, 0.3) },
            //Kd: { value: new THREE.Vector3(0.9, 0.5, 0.3) },
            //Ks: { value: new THREE.Vector3(0.8, 0.8, 0.8) },
            Ka: { value: new THREE.Vector3(a.x, a.y, a.z) },
            Kd: { value: new THREE.Vector3(b.x, b.y, b.z) },
            Ks: { value: new THREE.Vector3(c.x, c.y, c.z) },
            LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            Shininess: { value: 200.0 }
        },
        vertexShader: pvShader,
        fragmentShader: pfShader,
    });
    thematerials.push(phongMaterial);

    let lambertMaterial     = new THREE.MeshLambertMaterial( { color: materialColor, side: THREE.DoubleSide } );
    thematerials.push(lambertMaterial);

    let gouraudMaterial     = new THREE.MeshLambertMaterial( { color: materialColor, side: THREE.DoubleSide } );
    thematerials.push(gouraudMaterial);


//    let texturedMaterial = new THREE.MeshPhongMaterial({ color: materialColor, map: textureMap, side: THREE.DoubleSide });
    let texturedMaterial = new THREE.ShaderMaterial({
        //Optional, here you can supply uniforms and attributes
        uniforms:
        {
            time: { value: 0.0 },
            myColor: { value: new THREE.Color(0xACB6E5) },
            myColorTwo: { value: new THREE.Color(0x74ebd5) },
          },
        vertexShader: mvShader,
        fragmentShader: mfShader,
    });
    thematerials.push(texturedMaterial);

    console.log("inShader:" + shadingAlgorithmString[shading] );

    // redraw the teapot ----- (not done here )
    //shading = 4;
    Ateapot = new THREE.Mesh(
        teapotGeometry,
        thematerials[shading]);

    scene.add( Ateapot );
    teapotObjects.push(Ateapot);

    Ateapot.position.x = 6*scale;
}


// using the code as a string from  app.html --
function addAnotherTeapot()
{
    let teapotSize  = 1*scale;
    let tess        = -1;	// force initialization

    teapotSize      = 1*scale;
    //tess          = 5;

    let materialColor = new THREE.Color();
    materialColor.setRGB( 1.0, 0.8, 0.6 );

    let     vShader = document.getElementById('teapotVertexShader').innerHTML;
    let     fShader = document.getElementById('teapotFragmentShader').innerHTML;

    const teapotGeometry = new TeapotBufferGeometry(
        teapotSize,
        tess,
        true,
        true,
        true,
        true
    );

    let wireMaterial        = new THREE.MeshBasicMaterial( { color: 0xFFCC99, wireframe: true } ) ;
    let phongMaterial       = new THREE.MeshPhongMaterial( { color: materialColor, side: THREE.DoubleSide } );
    console.log(c);
    let   itemMaterial = new THREE.ShaderMaterial({
        //Optional, here you can supply uniforms and attributes
        uniforms:
            {
          //  Ka: { value: new THREE.Vector3(0.9, 0.5, 0.3) },
            //Kd: { value: new THREE.Vector3(0.9, 0.5, 0.3) },
            //Ks: { value: new THREE.Vector3(0.8, 0.8, 0.8) },
            Ka: { value: new THREE.Vector3(a.x,a.y,a.z) },
            Kd: { value: new THREE.Vector3(b.x, b.y, b.z)},
            Ks: { value: new THREE.Vector3(c.x, c.y, c.z)},
                LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
                LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
                Shininess: { value: 200.0 }
            },
        vertexShader:   vShader,
        fragmentShader: fShader,
    });

    Bteapot = new THREE.Mesh( teapotGeometry, itemMaterial );

    scene.add( Bteapot );
    teapotObjects.push(Bteapot);

    Bteapot.position.x = -6*scale;
}


// using the code as a string from  app.html --
function addBasicCube()
{
    // get from header - just another method .
    let     vShader = document.getElementById('cubeVertexShader').innerHTML;
    let     fShader = document.getElementById('cubeFragmentShader').innerHTML;
    let     itemMaterial = new THREE.ShaderMaterial({
        //Optional, here you can supply uniforms and attributes
        uniforms:
         {
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) }
        },
        vertexShader:   vShader,
        fragmentShader: fShader,
    });

    let geometry    = new THREE.BoxGeometry(1*scale, 1*scale, 1*scale)
    let mesh = new THREE.Mesh( geometry, itemMaterial );

    mesh.position.x = -2*scale;
    scene.add(mesh)
    sceneObjects.push(mesh)
}




// using the code as a string from  app.html -- using texture
function addAnotherBasicCube() // texture
{
    // either tex works.
    //let tex = THREE.ImageUtils.loadTexture('textures/crate.gif');
    let tex = new THREE.TextureLoader().load( 'textures/crate.gif', render );
    //optionally set some settings for it
    //tex.magFilter = THREE.NearestFilter;

    //Create the material, pass in the texture as a uniform with type 't'

    //Or, for non-jQuery kind of people
    let     vShader = document.getElementById('cubeVertexShader').innerHTML;
    let     fShader = document.getElementById('AnotherCubeFragmentShader').innerHTML;
    let     itemMaterial = new THREE.ShaderMaterial({
        //Optional, here you can supply uniforms and attributes
        uniforms:
            {
                theTexture: {type: 't', value: tex}
            },
        vertexShader:   vShader,
        fragmentShader: fShader,
        //Set transparent to true if your texture has some regions with alpha=0
        transparent: true
    });

    let geometry    = new THREE.BoxGeometry(1*scale, 1*scale, 1*scale)
    let mesh        = new THREE.Mesh(geometry, itemMaterial); // use new material

    mesh.position.x = 0*scale;
    scene.add(mesh)
    sceneObjects.push(mesh)
}


// =======> another method.
function vertexShader()
{
    // returns a string //  in  C program syntax '
    return `
    varying vec3 vUv; 
    varying vec4 modelViewPosition; 
    varying vec3 vecNormal;

    void main() 
    {
      vUv = position; 
      
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      vecNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz; 
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}

function fragmentShader()
{
    // returns a string //  in  C program syntax '
    return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() 
      {
        gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
      }
  `
}

function glowvShader() {
    return `
    varying vec3 Normal;
    varying vec3 Position;

    void main()
    {
        Normal = normalize(normalMatrix * normal);
        //Normal = normal;
        Position = vec3(modelViewMatrix * vec4(position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `
}

function glowfShader() {
    return `

   varying vec3 Normal;
        varying vec3 Position;
        uniform vec3 MatColor;
        uniform vec3 GlowColor;
        

        vec3 glow()
        {
          //return vec3(normalize(Normal.x * float(GlowColor)), normalize(Normal.y * float(GlowColor)), normalize(Normal.z * float(MatColor)));
           return mix(MatColor, GlowColor, max(max(Normal.x, Normal.y),Normal.z));
        }


        void main()
        {
            gl_FragColor = vec4(glow(), 1.0);
        }`
}



function addExperimentalCube()
{
    uniforms.colorA = {type: 'vec3', value: new THREE.Color(0x74ebd5)}
    uniforms.colorB = {type: 'vec3', value: new THREE.Color(0xACB6E5)}

    let geometry = new THREE.BoxGeometry(1*scale, 1*scale, 1*scale)
    let material =  new THREE.ShaderMaterial({
        uniforms:           uniforms,
        fragmentShader:     fragmentShader(),
        vertexShader:       vertexShader(),
    })

    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = 2*scale;
    scene.add(mesh)
    sceneObjects.push(mesh)
}


// Old renderer  -----
let temp = 0.0;
function render(time)
{
    temp++;
      
    renderer.render( scene, camera );
}


// Old helper grids -----
function createHelperGrids()
{
    // Create a Helper Grid ---------------------------------------------
    let size        = 200;
    let divisions   = 200;

    // Ground
    let gridHelper = new THREE.GridHelper( size, divisions, 0xff5555, 0x444488 );
    scene.add( gridHelper );

    //  Vertical
    let gridGround = new THREE.GridHelper( size, divisions, 0x55ff55, 0x667744 );
    gridGround.rotation.x = Math.PI / 2;
    scene.add( gridGround );
}


function animationLoop(ts)
{
    renderer.render( scene, camera )
    // now -- lets rotate the cubes ----
    let rotating      = 0.005;
    let rotatex     = rotating;
    let rotatey     = rotating;
    temp = temp ++;
    for( let object of sceneObjects )
    {
        
        object.rotation.x += rotatex
        object.rotation.y += rotatey
    }

    for( let object of teapotObjects )
    {
        if (shading == 8) {
            object.material.uniforms.time.value += temp;
        }
        object.rotation.x += controls[0].rotationSpeed;
        object.rotation.y += controls[0].rotationSpeed;
    }

    requestAnimationFrame(animationLoop)
}


function createCameraControls()
{
    cameraControls = new OrbitControls( camera, renderer.domElement );
}

function createLights()
{
    ambientLight    = new THREE.AmbientLight( 0x333333 );	        // 0.2
    light           = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
}


function adjustLighting()
{
    pointLight = new THREE.PointLight(0xdddddd)
    pointLight.position.set(-5, -3, 3)
    scene.add(pointLight)

    let ambientLight = new THREE.AmbientLight(0x505050)
    scene.add(ambientLight)
}

class Controller
{
    constructor(cube, controller)
    {
        this.cube = cube;
        this.controller = controller; // hacky

        // available data for the instantiations of the function
        this.rotationSpeed = 0.00;
        this.scale          = 1;
        this.Shader         = 1;
        this.theta = 0.1;
        this.PhongSettings = 0;
        this.parameters        = {a: false,}
    }
}


function init()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x555555 );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5*scale;
    camera.position.set(0 *scale, 10*scale, 10*scale);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );

    adjustLighting();

    createLights();

    addBasicCube();             // on left = -2*scale;

    addAnotherBasicCube();      // middle cube

    addExperimentalCube();      // on right

    addTheeJSTeapot();          // addTheeJSTeapot : rightmost

    addAnotherTeapot();         // shader teapot.

    controls = [];
    controls.push(new Controller( Ateapot, 0));
    addControls(controls[0]);

    createHelperGrids();

    createCameraControls();

    animationLoop();

}


init();
