"use strict";

var sceneJSONString;

initEditor();

function initEditor() {
  var renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var objects = [];
  var lights = [];
  var labelBoxes = [];
  var labelBoxCoordinates = [];

  var shadows = false;

  var scene, transformControls;
  var camera, orbitControls;
  var raycaster;
  var mouse = new THREE.Vector2();
  var mouseInitialization = false;
  var onDownPosition = new THREE.Vector2();
  var onUpPosition = new THREE.Vector2();
  var INTERSECTED, CLICKED, CURRENTDRAG;

  var cameraCube, sceneCube, equirectMaterial;

  var editorDiv = document.getElementById("editor");

  var backgroundColorInput = document.getElementById("background-color");
  var backgroundTextureInput = document.getElementById("background-texture");

  var gravityXInput = document.getElementById("gravity-x");
  var gravityYInput = document.getElementById("gravity-y");
  var gravityZInput = document.getElementById("gravity-z");

  var cameraXInput = document.getElementById("camera-x");
  var cameraYInput = document.getElementById("camera-y");
  var cameraZInput = document.getElementById("camera-z");

  var targetXInput = document.getElementById("target-x");
  var targetYInput = document.getElementById("target-y");
  var targetZInput = document.getElementById("target-z");

  var cameraFOVInput = document.getElementById("camera-fov");

  var shadowsButton = document.getElementById("shadows");

  var translateButton = document.getElementById("translate");
  var rotateButton = document.getElementById("rotate");
  var scaleButton = document.getElementById("scale");
  var trsEnabled = true;

  var objectsTab = document.getElementById("objects-tab");
  var lightsTab = document.getElementById("lights-tab");

  var objectList = document.getElementById("object-list");
  var selectedObjectDiv;

  var lightList = document.getElementById("light-list");
  var selectedLightDiv;

  var objectPositionXInput = document.getElementById("object-position-x");
  var objectPositionYInput = document.getElementById("object-position-y");
  var objectPositionZInput = document.getElementById("object-position-z");

  var objectRotationXInput = document.getElementById("object-rotation-x");
  var objectRotationYInput = document.getElementById("object-rotation-y");
  var objectRotationZInput = document.getElementById("object-rotation-z");

  var scaleXInput = document.getElementById("scale-x");
  var scaleYInput = document.getElementById("scale-y");
  var scaleZInput = document.getElementById("scale-z");

  var objectColorInput = document.getElementById("object-color");
  var opacityInput = document.getElementById("opacity");
  var objectTextureInput = document.getElementById("object-texture");

  var massInput = document.getElementById("mass");

  var linearVelocityXInput = document.getElementById("linear-velocity-x");
  var linearVelocityYInput = document.getElementById("linear-velocity-y");
  var linearVelocityZInput = document.getElementById("linear-velocity-z");

  var angularVelocityXInput = document.getElementById("angular-velocity-x");
  var angularVelocityYInput = document.getElementById("angular-velocity-y");
  var angularVelocityZInput = document.getElementById("angular-velocity-z");

  var pressureInput = document.getElementById("pressure");

  var frictionInput = document.getElementById("friction");
  var restitutionInput = document.getElementById("restitution");

  var shadingButton = document.getElementById("shading");
  var wireframeButton = document.getElementById("wireframe");
  var collisionButton = document.getElementById("collision");
  var objectTypeButton = document.getElementById("object-type");

  var lightPositionXInput;
  var lightPositionYInput;
  var lightPositionZInput;

  var objectsTabBody = document.getElementById("objects-tab-body");
  var lightsTabBody = document.getElementById("lights-tab-body");

  var parameterWrapper1 = document.getElementById("parameter-wrapper-1");
  var parameterWrapper2 = document.getElementById("parameter-wrapper-2");
  var parameterWrapper3 = document.getElementById("parameter-wrapper-3");
  var parameterWrapper4 = document.getElementById("parameter-wrapper-4");
  var parameterWrapper5 = document.getElementById("parameter-wrapper-5");
  var parameterWrapper6 = document.getElementById("parameter-wrapper-6");
  var parameterWrapper7 = document.getElementById("parameter-wrapper-7");

  var labelsBackground = document.getElementById("labels-background");
  var labelsModal = document.getElementById("labels-modal");
  var labelsContainer = document.getElementById("labels-container");

  init();
  render();

  initControlButtons();
  initLeftButtons();
  initParameterControls();

  function init() {
    renderer.setSize(editorDiv.clientWidth, editorDiv.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x32383f);
    editorDiv.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 0.01, 10000);
    camera.position.set(20, 20, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraCube = new THREE.PerspectiveCamera(70, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 0.01, 10000);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.enableKeys = false;

    scene = new THREE.Scene();

    sceneCube = new THREE.Scene();

    var gridHelper = new THREE.GridHelper(32, 32, 0xffffff, 0x808080);
    scene.add(gridHelper);

    var boxGeometry = new THREE.BoxBufferGeometry(4, 4, 4, 1, 1, 1);
    var boxMaterial = new THREE.MeshPhongMaterial({color: 0x551410, flatShading: true, side: THREE.DoubleSide});
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.name = "Box";
    setOtherParameters(box);
    addObjectToScene(box, false);

    box.position.y += 2;

    var sphereGeometry = new THREE.SphereBufferGeometry(2, 16, 16);
    var sphereMaterial = new THREE.MeshPhongMaterial({color: 0x1d1d47, flatShading: true, side: THREE.DoubleSide});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.name = "Sphere";
    setOtherParameters(sphere);
    addObjectToScene(sphere, false);

    sphere.position.y += 12;

    var groundGeometry = new THREE.BoxBufferGeometry(24, 1, 24, 1, 1, 1);
    var groundMaterial = new THREE.MeshPhongMaterial({color: 0x002955, flatShading: true, side: THREE.DoubleSide});
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.name = "Ground";
    setOtherParameters(ground);
    ground.mass = 0;
    addObjectToScene(ground, false);

    ground.position.y = -0.5;

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    ambientLight.name = "Ambient Light";
    addLightToScene(ambientLight, false);

    var directionalLight1 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight1.position.set(4, 16, 2);
    directionalLight1.name = "Directional Light";
    addLightToScene(directionalLight1, false);
/*
    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight2.position.set(-4, -16, -2);
    directionalLight2.name = "Directional Light";
    addLightToScene(directionalLight2, false);
*/
    var equirectShader = THREE.ShaderLib["equirect"];

    equirectMaterial = new THREE.ShaderMaterial({fragmentShader: getFrag(), vertexShader: equirectShader.vertexShader, uniforms: equirectShader.uniforms, depthWrite: false, side: THREE.BackSide});

    var backgroundMesh = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), equirectMaterial);
    sceneCube.add(backgroundMesh);

    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.setSpace("local");
    scene.add(transformControls);

    transformControls.addEventListener("change", function() {
      updateInputs();
      if (CLICKED && !isObject(CLICKED) && (CLICKED.light && (CLICKED.light.isDirectionalLight || CLICKED.light.isHemisphereLight || CLICKED.light.isSpotLight))) {
        CLICKED.update();
      }
    });

    raycaster = new THREE.Raycaster();

    editorDiv.children[0].addEventListener("mousemove", onEditorMouseMove);
    editorDiv.children[0].addEventListener("mousedown", onEditorMouseDown);
    window.addEventListener("resize", onWindowResize);
  }

  function getFrag() {
    return [
      "uniform sampler2D tEquirect;",
      "varying vec3 vWorldPosition;",
      "#include <common>",
      "void main() {",
        "vec3 direction = normalize( vWorldPosition );",
        "vec2 sampleUV;",
        "sampleUV.y = asin( direction.y ) * 0.3183098861 + 0.5;",
        "sampleUV.x = atan( direction.z, direction.x ) * 0.1591549430 + 0.5;",
        "gl_FragColor = texture2D( tEquirect, sampleUV );",
      "}"
    ].join("\n");
  }

  function onWindowResize() {
    camera.aspect = editorDiv.clientWidth / editorDiv.clientHeight;
    camera.updateProjectionMatrix();

    cameraCube.aspect = editorDiv.clientWidth / editorDiv.clientHeight;
    cameraCube.updateProjectionMatrix();

    renderer.setSize(editorDiv.clientWidth, editorDiv.clientHeight);
  }

  function getMousePosition(event) {
    var rect = renderer.domElement.getBoundingClientRect();
    var xPos = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    var yPos = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return [xPos, yPos];
  }

  function onEditorMouseMove(event) {
    event.preventDefault();
    mouse.fromArray(getMousePosition(event));
    mouseInitialization = true;
  }

  function onEditorMouseDown(event) {
    event.preventDefault();
    onDownPosition.fromArray(getMousePosition(event));
    editorDiv.addEventListener("mouseup", onEditorMouseUp);
  }

  function onEditorMouseUp(event) {
    onUpPosition.fromArray(getMousePosition(event));
    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(objects.concat(lights));
      if (intersects.length > 0) {
        if (isObject(intersects[0].object) || isGroup(intersects[0].object)) {
          focusObject(intersects[0].object);
        } else {
          focusLight(intersects[0].object);
        }
      } else if (CLICKED) {
        if (!trsEnabled) {
          enableTRS();
        }
        transformControls.detach();
        parameterWrapper2.innerHTML = "";
        parameterWrapper7.innerHTML = "";
        if (isObject(CLICKED) || isGroup(CLICKED)) {
          selectedObjectDiv.forEach(function(c) {
            c.classList.remove("list-active");
            c.classList.add("list-inactive");
          });
          selectedObjectDiv = null;
        } else {
          selectedLightDiv.classList.remove("list-active");
          selectedLightDiv.classList.add("list-inactive");
          selectedLightDiv = null;
        }
        CLICKED = null;
        updateVisibility();
      }
    }
    editorDiv.children[0].removeEventListener("mouseup", onEditorMouseUp);
  }

  function focusObject(object) {
    var objectDiv = objectList.children[objects.indexOf(object)];
    objectDiv.classList.remove("list-inactive");
    objectDiv.classList.add("list-active");
    if (selectedObjectDiv && selectedObjectDiv != [objectDiv]) {
      selectedObjectDiv.forEach(function(c) {
        c.classList.remove("list-active");
        c.classList.add("list-inactive");
      }); 
    }
    if (selectedLightDiv) {
      selectedLightDiv.classList.remove("list-active");
      selectedLightDiv.classList.add("list-inactive");
      selectedLightDiv = null;
    }
    selectedObjectDiv = [objectDiv];
    if (!trsEnabled) {
      enableTRS();
    }
    transformControls.attach(object);
    CLICKED = object;
    updateVisibility();
    addObjectSpecificParameters();
    updateInputs();
    focusTab("Objects");
  }

  function focusLight(lightHelper) {
    var lightDiv = lightList.children[lights.indexOf(lightHelper)];
    lightDiv.classList.remove("list-inactive");
    lightDiv.classList.add("list-active");
    if (selectedLightDiv && selectedLightDiv != lightDiv) {
      selectedLightDiv.classList.remove("list-active");
      selectedLightDiv.classList.add("list-inactive");
    }
    if (selectedObjectDiv) {
      selectedObjectDiv.forEach(function(c) {
        c.classList.remove("list-active");
        c.classList.add("list-inactive");
      }); 
      selectedObjectDiv = null;
    }
    selectedLightDiv = lightDiv;
    if (trsEnabled) {
      disableRS();
    }
    if (!lightHelper.light.isAmbientLight) {
      transformControls.attach(lightHelper.light);
    } else {
      transformControls.detach();
    }
    CLICKED = lightHelper;
    updateVisibility();
    addLightSpecificParameters();
    updateInputs();
    focusTab("Lights");
  }

  function addObjectToScene(object, focus, recursive=false) {
    if (shadows) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
    if (!recursive) {
      scene.add(object);
    }

    objects.push(object);
    addToObjectList(object);
    console.log(object);
    console.log(objects);
    if (object.children.length != 0) {
      object.children.forEach(c => {
        object.add(c);
        addObjectToScene(c, false, true);
      });
    }
    if (focus) {
      focusObject(object);
    }
  }

  function addLightToScene(light, focus) {
    if (!light.isAmbientLight && !light.isHemisphereLight) {
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
      light.shadow.camera.left = -25;
      light.shadow.camera.right = 25;
      light.shadow.camera.top = 25;
      light.shadow.camera.bottom = -25;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 100;
      if (shadows) {
        light.castShadow = true;
      }
    }
    if (light.isAmbientLight) {
      var ambientLightHelper = new THREE.Object3D();
      ambientLightHelper.visible = false;
      ambientLightHelper.light = light;
      scene.add(ambientLightHelper);
      scene.add(light);
      lights.push(ambientLightHelper);
      addToLightList(ambientLightHelper);
      if (focus) {
        focusLight(ambientLightHelper);
      }
    } else if (light.isDirectionalLight) {
      var directionalLightHelper = new THREE.DirectionalLightHelper(light, 1);
      scene.add(directionalLightHelper);
      scene.add(light);
      lights.push(directionalLightHelper);
      addToLightList(directionalLightHelper);
      if (focus) {
        focusLight(directionalLightHelper);
      }
    } else if (light.isHemisphereLight) {
      var hemisphereLightHelper = new THREE.HemisphereLightHelper(light, 1);
      scene.add(hemisphereLightHelper);
      scene.add(light);
      lights.push(hemisphereLightHelper);
      addToLightList(hemisphereLightHelper);
      if (focus) {
        focusLight(hemisphereLightHelper);
      }
    } else if (light.isPointLight) {
      var pointLightHelper = new THREE.PointLightHelper(light, 1);
      scene.add(pointLightHelper);
      scene.add(light);
      lights.push(pointLightHelper);
      addToLightList(pointLightHelper);
      if (focus) {
        focusLight(pointLightHelper);
      }
    } else if (light.isSpotLight) {
      var spotLightHelper = new THREE.SpotLightHelper(light);
      scene.add(spotLightHelper);
      scene.add(light);
      lights.push(spotLightHelper);
      addToLightList(spotLightHelper);
      if (focus) {
        focusLight(spotLightHelper);
      }
    }
  }

  function isObject(t) {
    return (typeof t.material !== "undefined" && t.material.isMeshPhongMaterial);
  }

  function isGroup(t) {
    if (t.type) {
      return t.type == "Group";
    } else {
      return false;
    }
  }

  function updateInputs() {
    if (CLICKED) {
      if (isObject(CLICKED) || isGroup(CLICKED)) {
        objectPositionXInput.value = CLICKED.position.x.toFixed(3);
        objectPositionYInput.value = CLICKED.position.y.toFixed(3);
        objectPositionZInput.value = CLICKED.position.z.toFixed(3);
        objectRotationXInput.value = (CLICKED.rotation.x * 180 / Math.PI).toFixed(3);
        objectRotationYInput.value = (CLICKED.rotation.y * 180 / Math.PI).toFixed(3);
        objectRotationZInput.value = (CLICKED.rotation.z * 180 / Math.PI).toFixed(3);
        scaleXInput.value = CLICKED.scale.x.toFixed(3);
        scaleYInput.value = CLICKED.scale.y.toFixed(3);
        scaleZInput.value = CLICKED.scale.z.toFixed(3);
        if (isObject(CLICKED)) {
          objectColorInput.value = "#" + CLICKED.material.color.getHexString();
          opacityInput.value = CLICKED.material.opacity.toFixed(3);
        }
        updateDropdown(objectTextureInput);
        objectTextureInput.value = CLICKED.textureURL;
        massInput.value = CLICKED.mass.toFixed(3);
        linearVelocityXInput.value = CLICKED.linearVelocityX.toFixed(3);
        linearVelocityYInput.value = CLICKED.linearVelocityY.toFixed(3);
        linearVelocityZInput.value = CLICKED.linearVelocityZ.toFixed(3);
        angularVelocityXInput.value = CLICKED.angularVelocityX.toFixed(3);
        angularVelocityYInput.value = CLICKED.angularVelocityY.toFixed(3);
        angularVelocityZInput.value = CLICKED.angularVelocityZ.toFixed(3);
        pressureInput.value = CLICKED.pressure.toFixed(3);
        frictionInput.value = CLICKED.friction.toFixed(3);
        restitutionInput.value = CLICKED.restitution.toFixed(3);
        updateCollision(CLICKED.collision);
        updateObjectType(CLICKED.soft);
      } else if (CLICKED.light && !CLICKED.light.isAmbientLight) {
        lightPositionXInput.value = CLICKED.light.position.x.toFixed(3);
        lightPositionYInput.value = CLICKED.light.position.y.toFixed(3);
        lightPositionZInput.value = CLICKED.light.position.z.toFixed(3);
      }
    }
  }

  function updateDropdown(input) {
    input.innerHTML = "<option></option>";
    if (typeof window.parent.getProjectAssets === "function") {
      var assets = window.parent.getProjectAssets();
      if (assets !== "") {
        var textures = assets.split(",");
        for (var i = 0; i < textures.length; i++) {
          input.innerHTML += "<option>" + textures[i] + "</option>";
        }
      }
    }
  }

  function updateVisibility() {
    if (CLICKED && (isObject(CLICKED)||isGroup(CLICKED))) {
      parameterWrapper1.style.display = "block";
      if (CLICKED.soft) {
        parameterWrapper3.style.display = "none";
        parameterWrapper4.style.display = "block";
        parameterWrapper6.style.display = "none";
      } else {
        parameterWrapper3.style.display = "block";
        parameterWrapper4.style.display = "none";
        parameterWrapper6.style.display = "block";
      }
      parameterWrapper5.style.display = "block";
    } else {
      parameterWrapper1.style.display = "none";
      parameterWrapper3.style.display = "none";
      parameterWrapper4.style.display = "none";
      parameterWrapper5.style.display = "none";
    }
  }

  function render() {
    requestAnimationFrame(render);
    orbitControls.update();
    transformControls.update();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects.concat(lights));
    if (intersects.length > 0 && mouseInitialization) {
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED && isObject(INTERSECTED)) {
          INTERSECTED.material.emissive.setHex(0);
        }
        INTERSECTED = intersects[0].object;
        if (isObject(INTERSECTED)) {
          INTERSECTED.material.emissive.setHex(0x222222);
        }
      }
    } else {
      if (INTERSECTED && isObject(INTERSECTED)) {
        INTERSECTED.material.emissive.setHex(0);
      }
      INTERSECTED = null;
    }
    cameraCube.rotation.copy(camera.rotation);
    renderer.render(sceneCube, cameraCube);
    renderer.render(scene, camera);
  };

  function enableTRS() {
    translateButton.classList.remove("control-disabled");
    rotateButton.classList.remove("control-disabled");
    scaleButton.classList.remove("control-disabled");
    translateButton.addEventListener("click", enableTranslate);
    rotateButton.addEventListener("click", enableRotate);
    scaleButton.addEventListener("click", enableScale);
    trsEnabled = true;
  }

  function enableTranslate() {
    translateButton.classList.remove("control-inactive");
    translateButton.classList.add("control-active");
    rotateButton.classList.remove("control-active");
    rotateButton.classList.add("control-inactive");
    scaleButton.classList.remove("control-active");
    scaleButton.classList.add("control-inactive");
    transformControls.setMode("translate");
  }

  function enableRotate() {
    rotateButton.classList.remove("control-inactive");
    rotateButton.classList.add("control-active");
    translateButton.classList.remove("control-active");
    translateButton.classList.add("control-inactive");
    scaleButton.classList.remove("control-active");
    scaleButton.classList.add("control-inactive");
    transformControls.setMode("rotate");
  }

  function enableScale() {
    scaleButton.classList.remove("control-inactive");
    scaleButton.classList.add("control-active");
    translateButton.classList.remove("control-active");
    translateButton.classList.add("control-inactive");
    rotateButton.classList.remove("control-active");
    rotateButton.classList.add("control-inactive");
    transformControls.setMode("scale");
  }

  function disableRS() {
    translateButton.removeEventListener("click", enableTranslate);
    rotateButton.removeEventListener("click", enableRotate);
    scaleButton.removeEventListener("click", enableScale);
    translateButton.classList.remove("control-inactive");
    translateButton.classList.add("control-active");
    rotateButton.classList.remove("control-active");
    rotateButton.classList.remove("control-inactive");
    rotateButton.classList.add("control-disabled");
    scaleButton.classList.remove("control-active");
    scaleButton.classList.remove("control-inactive");
    scaleButton.classList.add("control-disabled");
    transformControls.setMode("translate");
    trsEnabled = false;
  }

  function initControlButtons() {
    enableTRS();
    var duplicateButton = document.getElementById("duplicate");
    duplicateButton.addEventListener("click", function() {
      if (CLICKED) {
        if (isObject(CLICKED)) {
          var cloneGeometry = CLICKED.geometry.clone();
          cloneGeometry.parameters = CLICKED.geometry.parameters;
          cloneGeometry.type = CLICKED.geometry.type;
          var cloneMaterial = CLICKED.material.clone();
          var clone = CLICKED.clone();
          clone.geometry = cloneGeometry;
          clone.material = cloneMaterial;
          clone.position.addScalar(2);
          clone.textureURL = CLICKED.textureURL;
          clone.mass = CLICKED.mass;
          clone.linearVelocityX = CLICKED.linearVelocityX;
          clone.linearVelocityY = CLICKED.linearVelocityY;
          clone.linearVelocityZ = CLICKED.linearVelocityZ;
          clone.angularVelocityX = CLICKED.angularVelocityX;
          clone.angularVelocityY = CLICKED.angularVelocityY;
          clone.angularVelocityZ = CLICKED.angularVelocityZ;
          clone.pressure = CLICKED.pressure;
          clone.friction = CLICKED.friction;
          clone.restitution = CLICKED.restitution;
          clone.collision = CLICKED.collision;
          clone.soft = CLICKED.soft;
          addObjectToScene(clone, true);
        } else if (isGroup(CLICKED)) {
          var clone = CLICKED.clone();
          clone.geometry = cloneGeometry;
          clone.material = cloneMaterial;
          clone.position.addScalar(2);
          clone.textureURL = CLICKED.textureURL;
          clone.mass = CLICKED.mass;
          clone.linearVelocityX = CLICKED.linearVelocityX;
          clone.linearVelocityY = CLICKED.linearVelocityY;
          clone.linearVelocityZ = CLICKED.linearVelocityZ;
          clone.angularVelocityX = CLICKED.angularVelocityX;
          clone.angularVelocityY = CLICKED.angularVelocityY;
          clone.angularVelocityZ = CLICKED.angularVelocityZ;
          clone.pressure = CLICKED.pressure;
          clone.friction = CLICKED.friction;
          clone.restitution = CLICKED.restitution;
          clone.collision = CLICKED.collision;
          clone.soft = CLICKED.soft;
          addObjectToScene(clone, true);
        } else {
          if (CLICKED.light.isAmbientLight) {
            var ambientLight = new THREE.AmbientLight(CLICKED.light.color, CLICKED.light.intensity);
            ambientLight.name = CLICKED.light.name;
            addLightToScene(ambientLight, true);
          } else if (CLICKED.light.isDirectionalLight) {
            var directionalLight = new THREE.DirectionalLight(CLICKED.light.color, CLICKED.light.intensity);
            directionalLight.position.set(CLICKED.light.position.x + 2, CLICKED.light.position.y + 2, CLICKED.light.position.z + 2);
            directionalLight.name = CLICKED.light.name;
            addLightToScene(directionalLight, true);
          } else if (CLICKED.light.isHemisphereLight) {
            var hemisphereLight = new THREE.HemisphereLight(CLICKED.light.color, CLICKED.light.groundColor, CLICKED.light.intensity);
            hemisphereLight.position.set(CLICKED.light.position.x + 2, CLICKED.light.position.y + 2, CLICKED.light.position.z + 2);
            hemisphereLight.name = CLICKED.light.name;
            addLightToScene(hemisphereLight, true);
          } else if (CLICKED.light.isPointLight) {
            var pointLight = new THREE.PointLight(CLICKED.light.color, CLICKED.light.intensity);
            pointLight.position.set(CLICKED.light.position.x + 2, CLICKED.light.position.y + 2, CLICKED.light.position.z + 2);
            pointLight.name = CLICKED.light.name;
            addLightToScene(pointLight, true);
          } else if (CLICKED.light.isSpotLight) {
            var spotLight = new THREE.SpotLight(CLICKED.light.color, CLICKED.light.intensity, CLICKED.light.distance, CLICKED.light.angle, CLICKED.light.penumbra, CLICKED.light.decay);
            spotLight.position.set(CLICKED.light.position.x + 2, CLICKED.light.position.y + 2, CLICKED.light.position.z + 2);
            spotLight.name = CLICKED.light.name;
            addLightToScene(spotLight, true);
          }
        }
      }
    });
    var importButton = document.getElementById("import");
    var importJSON = document.getElementById("import-json");
    importButton.addEventListener("click", function() {
      importJSON.click();
    });
    importJSON.addEventListener("change", function(event) {
      if (this.value !== "") {
        var reader = new FileReader();
        reader.onload = function(event) {
          importScene(event.target.result);
        };
        reader.readAsText(event.target.files[0]);
        this.value = "";
      }
    });
    var exportButton = document.getElementById("export");
    exportButton.addEventListener("click", function() {
      exportScene();
    });
    var vrButton = document.getElementById("vr");
    vrButton.addEventListener("click", function() {
      sceneJSONString = generateSceneJSONString();
      var win = window.open("vr.html", "_blank");
    });
    var deleteButton = document.getElementById("delete");
    deleteButton.addEventListener("click", function() {
      if (CLICKED) {
        transformControls.detach();
        if (isObject(CLICKED) && CLICKED.children.length == 0) {
          var index = objects.indexOf(CLICKED);
          objects.splice(index, 1);
          selectedObjectDiv = null;
          objectList.removeChild(objectList.children[index]);
          CLICKED.parent.remove(CLICKED);
        } else if (isGroup(CLICKED)|| isObject(CLICKED) && CLICKED.children.length > 0) {
          var index = objects.indexOf(CLICKED);
          var numAncestors = countAncestors(CLICKED, 0);
          objects.splice(index, numAncestors +1);
          selectedObjectDiv = null;
          for (var i = numAncestors; i >= 0; i--) {
            objectList.removeChild(objectList.children[index+i]);
          }
          CLICKED.parent.remove(CLICKED);
        } else {
          var index = lights.indexOf(CLICKED);
          lights.splice(index, 1);
          selectedLightDiv = null;
          lightList.removeChild(lightList.children[index]);
          scene.remove(CLICKED.light);
        }
        scene.remove(CLICKED);
        CLICKED = null;
        updateVisibility();
        parameterWrapper2.innerHTML = "";
        parameterWrapper7.innerHTML = "";
      }
    });
    var clearButton = document.getElementById("clear");
    clearButton.addEventListener("click", function() {
      clearScene();
    });
    objectsTab.addEventListener("click", function() {
      focusTab("Objects");
    });
    lightsTab.addEventListener("click", function() {
      focusTab("Lights");
    });
  }

  function focusTab(tab) {
    switch (tab) {
      case "Objects":
        objectsTab.classList.remove("objects-tab-inactive");
        objectsTab.classList.add("objects-tab-active");
        lightsTab.classList.remove("lights-tab-active");
        lightsTab.classList.add("lights-tab-inactive");
        objectsTabBody.style.display = "block";
        lightsTabBody.style.display = "none";
        break;
      case "Lights":
        lightsTab.classList.remove("lights-tab-inactive");
        lightsTab.classList.add("lights-tab-active");
        objectsTab.classList.remove("objects-tab-active");
        objectsTab.classList.add("objects-tab-inactive");
        lightsTabBody.style.display = "block";
        objectsTabBody.style.display = "none";
        break;
      default:
        return;
    }
  }

  importScene = function importScene(sceneJSONString) {
    var sceneJSON = JSON.parse(sceneJSONString);
    var worldJSON = sceneJSON[0];
    backgroundColorInput.value = "#" + new THREE.Color(worldJSON.backgroundcolor).getHexString();
    backgroundTextureInput.value = worldJSON.backgroundtexture;
    gravityXInput.value = worldJSON.gravityx.toFixed(3);
    gravityYInput.value = worldJSON.gravityy.toFixed(3);
    gravityZInput.value = worldJSON.gravityz.toFixed(3);
    cameraXInput.value = worldJSON.camerax.toFixed(3);
    cameraYInput.value = worldJSON.cameray.toFixed(3);
    cameraZInput.value = worldJSON.cameraz.toFixed(3);
    targetXInput.value = worldJSON.targetx.toFixed(3);
    targetYInput.value = worldJSON.targety.toFixed(3);
    targetZInput.value = worldJSON.targetz.toFixed(3);
    cameraFOVInput.value = worldJSON.camerafov.toFixed(3);
    if (worldJSON.backgroundtexture !== "") {
      var equirectTexture = new THREE.TextureLoader().load(getTextureURL(worldJSON.backgroundtexture));
      equirectTexture.mapping = THREE.EquirectangularReflectionMapping;
      equirectMaterial.uniforms["tEquirect"].value = equirectTexture;
      renderer.autoClear = false;
    } else {
      equirectMaterial.uniforms["tEquirect"].value = null;
      renderer.autoClear = true;
    }
    shadows = worldJSON.shadows;
    updateShadows();
    var labelsJSON = sceneJSON[1];
    for (var i = 0; i < labelsJSON.length; i++) {
      var labelJSON = labelsJSON[i];
      addLabel(labelJSON.left, labelJSON.top);
    }
    var objectsJSON = sceneJSON[2];
    for (var i = 0; i < objectsJSON.length; i++) {
      var objectJSON = objectsJSON[i];
      var objectGeometry;
      switch (objectJSON.type) {
        case "BoxBufferGeometry":
          objectGeometry = new THREE.BoxBufferGeometry(objectJSON.boxwidth, objectJSON.boxheight, objectJSON.boxdepth, objectJSON.boxwidthsegments, objectJSON.boxheightsegments, objectJSON.boxdepthsegments);
          break;
        case "ConeBufferGeometry":
          objectGeometry = new THREE.ConeBufferGeometry(objectJSON.coneradius, objectJSON.coneheight, objectJSON.coneradialsegments);
          break;
        case "CylinderBufferGeometry":
          objectGeometry = new THREE.CylinderBufferGeometry(objectJSON.cylinderradiustop, objectJSON.cylinderradiusbottom, objectJSON.cylinderheight, objectJSON.cylinderradialsegments);
          break;
        case "DodecahedronBufferGeometry":
          objectGeometry = new THREE.DodecahedronBufferGeometry(objectJSON.dodecahedronradius);
          break;
        case "IcosahedronBufferGeometry":
          objectGeometry = new THREE.IcosahedronBufferGeometry(objectJSON.icosahedronradius);
          break;
        case "OctahedronBufferGeometry":
          objectGeometry = new THREE.OctahedronBufferGeometry(objectJSON.octahedronradius);
          break;
        case "SphereBufferGeometry":
          objectGeometry = new THREE.SphereBufferGeometry(objectJSON.sphereradius, objectJSON.spherewidthsegments, objectJSON.sphereheightsegments);
          break;
        case "TetrahedronBufferGeometry":
          objectGeometry = new THREE.TetrahedronBufferGeometry(objectJSON.tetrahedronradius);
          break;
        default:
          return;
      }
      var objectMaterial;
      if (objectJSON.textureURL === "") {
        objectMaterial = new THREE.MeshPhongMaterial({color: objectJSON.color, flatShading: objectJSON.flatshading, side: THREE.DoubleSide, wireframe: objectJSON.wireframe});
      } else {
        var texture = new THREE.TextureLoader().load(getTextureURL(objectJSON.textureURL));
        objectMaterial = new THREE.MeshPhongMaterial({color: objectJSON.color, map: texture, flatShading: objectJSON.flatshading, side: THREE.DoubleSide, wireframe: objectJSON.wireframe});
      }
      var object = new THREE.Mesh(objectGeometry, objectMaterial);
      object.position.set(objectJSON.positionx, objectJSON.positiony, objectJSON.positionz);
      object.rotation.set(objectJSON.rotationx, objectJSON.rotationy, objectJSON.rotationz);
      object.scale.set(objectJSON.scalex, objectJSON.scaley, objectJSON.scalez);
      object.material.color = new THREE.Color(objectJSON.color);
      object.material.opacity = objectJSON.opacity;
      if (objectJSON.opacity < 1) {
        object.material.transparent = true;
      }
      object.textureURL = objectJSON.textureURL;
      object.mass = objectJSON.mass;
      object.linearVelocityX = objectJSON.linearvelocityx;
      object.linearVelocityY = objectJSON.linearvelocityy;
      object.linearVelocityZ = objectJSON.linearvelocityz;
      object.angularVelocityX = objectJSON.angularvelocityx;
      object.angularVelocityY = objectJSON.angularvelocityy;
      object.angularVelocityZ = objectJSON.angularvelocityz;
      object.pressure = objectJSON.pressure;
      object.friction = objectJSON.friction;
      object.restitution = objectJSON.restitution;
      object.collision = objectJSON.collision;
      object.soft = objectJSON.soft;
      object.name = objectJSON.name;
      addObjectToScene(object, false);
    }
    var lightsJSON = sceneJSON[3];
    for (var i = 0; i < lightsJSON.length; i++) {
      var lightJSON = lightsJSON[i];
      switch (lightJSON.type) {
        case "AmbientLight":
          var ambientLight = new THREE.AmbientLight(lightJSON.color, lightJSON.intensity);
          ambientLight.name = lightJSON.name;
          addLightToScene(ambientLight, false);
          break;
        case "DirectionalLight":
          var directionalLight = new THREE.DirectionalLight(lightJSON.color, lightJSON.intensity);
          directionalLight.position.set(lightJSON.positionx, lightJSON.positiony, lightJSON.positionz);
          directionalLight.name = lightJSON.name;
          addLightToScene(directionalLight, false);
          break;
        case "HemisphereLight":
          var hemisphereLight = new THREE.HemisphereLight(lightJSON.skycolor, lightJSON.groundcolor, lightJSON.intensity);
          hemisphereLight.position.set(lightJSON.positionx, lightJSON.positiony, lightJSON.positionz);
          hemisphereLight.name = lightJSON.name;
          addLightToScene(hemisphereLight, false);
          break;
        case "PointLight":
          var pointLight = new THREE.PointLight(lightJSON.color, lightJSON.intensity);
          pointLight.position.set(lightJSON.positionx, lightJSON.positiony, lightJSON.positionz);
          pointLight.name = lightJSON.name;
          addLightToScene(pointLight, false);
          break;
        case "SpotLight":
          var spotLight = new THREE.SpotLight(lightJSON.color, lightJSON.intensity, lightJSON.distance, lightJSON.angle, lightJSON.penumbra, lightJSON.decay);
          spotLight.position.set(lightJSON.positionx, lightJSON.positiony, lightJSON.positionz);
          spotLight.name = lightJSON.name;
          addLightToScene(spotLight, false);
        default:
          return;
      }
    }
  }

  clearScene = function clearScene() {
    if (CLICKED) {
      transformControls.detach();
    }
    for (var i = 0; i < objects.length; i++) {
      scene.remove(objects[i]);
    }
    for (var i = 0; i < lights.length; i++) {
      scene.remove(lights[i]);
      scene.remove(lights[i].light);
    }
    objects = [];
    lights = [];
    CLICKED = null;
    updateVisibility();
    parameterWrapper2.innerHTML = "";
    parameterWrapper7.innerHTML = "";
    selectedObjectDiv = null;
    selectedLightDiv = null;
    objectList.innerHTML = "";
    lightList.innerHTML = "";
  }

  function syncObjectList() {
    var newObjects = []
    for (var i = 0; i < objects.length; i++) {
      var objectName = objectList.children[i].textContent;
      newObjects.push(objects.filter( o=> {
        return o.name === objectName;
      })[0]);
    };
    objects = newObjects;
  }

  generateSceneJSONString = function generateSceneJSONString() {
    var sceneJSON = [];
    var worldJSON = {};
    worldJSON.backgroundcolor = new THREE.Color(backgroundColorInput.value);
    worldJSON.backgroundtexture = backgroundTextureInput.value;
    worldJSON.gravityx = gravityXInput.valueAsNumber;
    worldJSON.gravityy = gravityYInput.valueAsNumber;
    worldJSON.gravityz = gravityZInput.valueAsNumber;
    worldJSON.camerax = cameraXInput.valueAsNumber;
    worldJSON.cameray = cameraYInput.valueAsNumber;
    worldJSON.cameraz = cameraZInput.valueAsNumber;
    worldJSON.targetx = targetXInput.valueAsNumber;
    worldJSON.targety = targetYInput.valueAsNumber;
    worldJSON.targetz = targetZInput.valueAsNumber;
    worldJSON.camerafov = cameraFOVInput.valueAsNumber;
    worldJSON.shadows = shadows;
    sceneJSON.push(worldJSON);
    var labelsJSON = [];
    for (var i = 0; i < labelBoxes.length; i++) {
      var labelJSON = {};
      var label = labelBoxes[i];
      labelJSON.left = labelBoxCoordinates[i][0];
      labelJSON.top = labelBoxCoordinates[i][1];
      labelsJSON.push(labelJSON);
    }
    sceneJSON.push(labelsJSON);
    var objectsJSON = [];
    for (var i = 0; i < objects.length; i++) {
      var objectJSON = {};
      var object = objects[i];
      objectJSON.type = object.geometry.type;
      objectJSON.name = object.name;
      objectJSON.positionx = object.position.x;
      objectJSON.positiony = object.position.y;
      objectJSON.positionz = object.position.z;
      objectJSON.rotationx = object.rotation.x;
      objectJSON.rotationy = object.rotation.y;
      objectJSON.rotationz = object.rotation.z;
      objectJSON.scalex = object.scale.x;
      objectJSON.scaley = object.scale.y;
      objectJSON.scalez = object.scale.z;
      objectJSON.color = object.material.color;
      objectJSON.opacity = object.material.opacity;
      objectJSON.textureURL = object.textureURL;
      objectJSON.mass = object.mass;
      switch (object.geometry.type) {
        case "BoxBufferGeometry":
          objectJSON.boxwidth = object.geometry.parameters.width;
          objectJSON.boxheight = object.geometry.parameters.height;
          objectJSON.boxdepth = object.geometry.parameters.depth;
          objectJSON.boxwidthsegments = object.geometry.parameters.widthSegments;
          objectJSON.boxheightsegments = object.geometry.parameters.heightSegments;
          objectJSON.boxdepthsegments = object.geometry.parameters.depthSegments;
          break;
        case "ConeBufferGeometry":
          objectJSON.coneradius = object.geometry.parameters.radius;
          objectJSON.coneheight = object.geometry.parameters.height;
          objectJSON.coneradialsegments = object.geometry.parameters.radialSegments;
          break;
        case "CylinderBufferGeometry":
          objectJSON.cylinderradiustop = object.geometry.parameters.radiusTop;
          objectJSON.cylinderradiusbottom = object.geometry.parameters.radiusBottom;
          objectJSON.cylinderheight = object.geometry.parameters.height;
          objectJSON.cylinderradialsegments = object.geometry.parameters.radialSegments;
          break;
        case "DodecahedronBufferGeometry":
          objectJSON.dodecahedronradius = object.geometry.parameters.radius;
          break;
        case "IcosahedronBufferGeometry":
          objectJSON.icosahedronradius = object.geometry.parameters.radius;
          break;
        case "OctahedronBufferGeometry":
          objectJSON.octahedronradius = object.geometry.parameters.radius;
          break;
        case "SphereBufferGeometry":
          objectJSON.sphereradius = object.geometry.parameters.radius;
          objectJSON.spherewidthsegments = object.geometry.parameters.widthSegments;
          objectJSON.sphereheightsegments = object.geometry.parameters.heightSegments;
          break;
        case "TetrahedronBufferGeometry":
          objectJSON.tetrahedronradius = object.geometry.parameters.radius;
          break;
        default:
          return;
      }
      objectJSON.linearvelocityx = object.linearVelocityX;
      objectJSON.linearvelocityy = object.linearVelocityY;
      objectJSON.linearvelocityz = object.linearVelocityZ;
      objectJSON.angularvelocityx = object.angularVelocityX;
      objectJSON.angularvelocityy = object.angularVelocityY;
      objectJSON.angularvelocityz = object.angularVelocityZ;
      objectJSON.pressure = object.pressure;
      objectJSON.friction = object.friction;
      objectJSON.restitution = object.restitution;
      objectJSON.flatshading = object.material.flatShading;
      objectJSON.wireframe = object.material.wireframe;
      objectJSON.collision = object.collision;
      objectJSON.soft = object.soft;
      objectsJSON.push(objectJSON);
    }
    sceneJSON.push(objectsJSON);
    var lightsJSON = [];
    for (var i = 0; i < lights.length; i++) {
      var lightJSON = {};
      var light = lights[i].light;
      lightJSON.type = light.type;
      lightJSON.name = light.name;
      if (light.isAmbientLight) {
        lightJSON.color = light.color;
        lightJSON.intensity = light.intensity;
      } else if (light.isDirectionalLight) {
        lightJSON.positionx = light.position.x;
        lightJSON.positiony = light.position.y;
        lightJSON.positionz = light.position.z;
        lightJSON.color = light.color;
        lightJSON.intensity = light.intensity;
      } else if (light.isHemisphereLight) {
        lightJSON.positionx = light.position.x;
        lightJSON.positiony = light.position.y;
        lightJSON.positionz = light.position.z;
        lightJSON.skycolor = light.color;
        lightJSON.groundcolor = light.groundColor;
        lightJSON.intensity = light.intensity;
      } else if (light.isPointLight) {
        lightJSON.positionx = light.position.x;
        lightJSON.positiony = light.position.y;
        lightJSON.positionz = light.position.z;
        lightJSON.color = light.color;
        lightJSON.intensity = light.intensity;
      } else if (light.isSpotLight) {
        lightJSON.positionx = light.position.x;
        lightJSON.positiony = light.position.y;
        lightJSON.positionz = light.position.z;
        lightJSON.color = light.color;
        lightJSON.intensity = light.intensity;
        lightJSON.distance = light.distance;
        lightJSON.angle = light.angle;
        lightJSON.penumbra = light.penumbra;
        lightJSON.decay = light.decay;
      }
      lightsJSON.push(lightJSON);
    }
    sceneJSON.push(lightsJSON);
    return JSON.stringify(sceneJSON, null, "\t");
  }

  function exportScene() {
    //window.open("data:application/json," + encodeURIComponent(generateSceneJSONString()), "_blank");
    console.log(generateSceneJSONString());
  }

  function initLeftButtons() {
    var boxButton = document.getElementById("box");
    var coneButton = document.getElementById("cone");
    var cylinderButton = document.getElementById("cylinder");
    var dodecahedronButton = document.getElementById("dodecahedron");
    var icosahedronButton = document.getElementById("icosahedron");
    var octahedronButton = document.getElementById("octahedron");
    var sphereButton = document.getElementById("sphere");
    var tetrahedronButton = document.getElementById("tetrahedron");
    var groupButton = document.getElementById("group");
    var ambientButton = document.getElementById("ambient");
    var directionalButton = document.getElementById("directional");
    var hemisphereButton = document.getElementById("hemisphere");
    var pointButton = document.getElementById("point");
    var spotButton = document.getElementById("spot");
    var labelsButton = document.getElementById("labels");
    var addLabelButton = document.getElementById("add-label");
    var deleteLabelButton = document.getElementById("delete-label");
    var counter;
    boxButton.addEventListener("click", function() {
      var boxGeometry = new THREE.BoxBufferGeometry(4, 4, 4, 1, 1, 1);
      var boxMaterial = new THREE.MeshPhongMaterial({color: 0x551410, flatShading: true, side: THREE.DoubleSide});
      var box = new THREE.Mesh(boxGeometry, boxMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Box");
      }).length;
      if (counter > 0) {
        box.name = "Box " + counter;
      } else {
        box.name = "Box";
      }
      setOtherParameters(box);
      addObjectToScene(box, true);
    });
    coneButton.addEventListener("click", function() {
      var coneGeometry = new THREE.ConeBufferGeometry(2, 4, 16);
      var coneMaterial = new THREE.MeshPhongMaterial({color: 0x553200, flatShading: true, side: THREE.DoubleSide});
      var cone = new THREE.Mesh(coneGeometry, coneMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Cone");
      }).length;
      if (counter > 0) {
        cone.name = "Cone " + counter;
      } else {
        cone.name = "Cone";
      }
      setOtherParameters(cone);
      addObjectToScene(cone, true);
    });
    cylinderButton.addEventListener("click", function() {
      var cylinderGeometry = new THREE.CylinderBufferGeometry(2, 2, 4, 16);
      var cylinderMaterial = new THREE.MeshPhongMaterial({color: 0x554400, flatShading: true, side: THREE.DoubleSide});
      var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Cylinder");
      }).length;
      if (counter > 0) {
        cylinder.name = "Cylinder " + counter;
      } else {
        cylinder.name = "Cylinder";
      }
      setOtherParameters(cylinder);
      addObjectToScene(cylinder, true);
    });
    dodecahedronButton.addEventListener("click", function() {
      var dodecahedronGeometry = new THREE.DodecahedronBufferGeometry(2);
      var dodecahedronMaterial = new THREE.MeshPhongMaterial({color: 0x194821, flatShading: true, side: THREE.DoubleSide});
      var dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecahedronMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Dodecahedron");
      }).length;
      if (counter > 0) {
        dodecahedron.name = "Dodecahedron " + counter;
      } else {
        dodecahedron.name = "Dodecahedron";
      }
      setOtherParameters(dodecahedron);
      addObjectToScene(dodecahedron, true);
    });
    icosahedronButton.addEventListener("click", function() {
      var icosahedronGeometry = new THREE.IcosahedronBufferGeometry(2);
      var icosahedronMaterial = new THREE.MeshPhongMaterial({color: 0x1e4353, flatShading: true, side: THREE.DoubleSide});
      var icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Icosahedron");
      }).length;
      if (counter > 0) {
        icosahedron.name = "Icosahedron " + counter;
      } else {
        icosahedron.name = "Icosahedron";
      }
      setOtherParameters(icosahedron);
      addObjectToScene(icosahedron, true);
    });
    octahedronButton.addEventListener("click", function() {
      var octahedronGeometry = new THREE.OctahedronBufferGeometry(2);
      var octahedronMaterial = new THREE.MeshPhongMaterial({color: 0x002955, flatShading: true, side: THREE.DoubleSide});
      var octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Octahedron");
      }).length;
      if (counter > 0) {
        octahedron.name = "Octahedron " + counter;
      } else {
        octahedron.name = "Octahedron";
      }
      setOtherParameters(octahedron);
      addObjectToScene(octahedron, true);
    });
    sphereButton.addEventListener("click", function() {
      var sphereGeometry = new THREE.SphereBufferGeometry(2, 16, 16);
      var sphereMaterial = new THREE.MeshPhongMaterial({color: 0x1d1d47, flatShading: true, side: THREE.DoubleSide});
      var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Sphere");
      }).length;
      if (counter > 0) {
        sphere.name = "Sphere " + counter;
      } else {
        sphere.name = "Sphere";
      }
      setOtherParameters(sphere);
      addObjectToScene(sphere, true);
    });
    tetrahedronButton.addEventListener("click", function() {
      var tetrahedronGeometry = new THREE.TetrahedronBufferGeometry(2);
      var tetrahedronMaterial = new THREE.MeshPhongMaterial({color: 0x550f1c, flatShading: true, side: THREE.DoubleSide});
      var tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
      counter = objects.filter( o => {
        return o.name.includes("Tetrahedron");
      }).length;
      if (counter > 0) {
        tetrahedron.name = "Tetrahedron " + counter;
      } else {
        tetrahedron.name = "Tetrahedron";
      }
      setOtherParameters(tetrahedron);
      addObjectToScene(tetrahedron, true);
    });
    groupButton.addEventListener("click", function() {
      var group = new THREE.Group();
      counter = objects.filter( o => {
        return o.name.includes("Group");
      }).length;
      if (counter > 0) {
        group.name = "Group " + counter;
      } else {
        group.name = "Group";
      }
      setOtherParameters(group);
      addObjectToScene(group, true);
    });
    ambientButton.addEventListener("click", function() {
      var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      counter = lights.filter( o => {
        return o.name.includes("Ambient Light");
      }).length;
      if (counter > 0) {
        ambientLight.name = "Ambient Light " + counter;
      } else {
        ambientLight.name = "Ambient Light";
      }
      addLightToScene(ambientLight, true);
    })
    directionalButton.addEventListener("click", function() {
      var directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
      directionalLight.position.set(2, 8, 1);
      counter = lights.filter( o => {
        return o.name.includes("Directional Light");
      }).length;
      if (counter > 0) {
        directionalLight.name = "Directional Light " + counter;
      } else {
        directionalLight.name = "Directional Light";
      }
      addLightToScene(directionalLight, true);
    });
    hemisphereButton.addEventListener("click", function() {
      var hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 1);
      counter = lights.filter( o => {
        return o.name.includes("Hemisphere Light");
      }).length;
      if (counter > 0) {
        hemisphereLight.name = "Hemisphere Light " + counter;
      } else {
        hemisphereLight.name = "Hemisphere Light";
      }
      addLightToScene(hemisphereLight, true);
    })
    pointButton.addEventListener("click", function() {
      var pointLight = new THREE.PointLight(0xff0000, 1);
      pointLight.position.set(10, 10, 0);
      counter = lights.filter( o => {
        return o.name.includes("Point Light");
      }).length;
      if (counter > 0) {
        pointLight.name = "Point Light " + counter;
      } else {
        pointLight.name = "Point Light";
      }
      addLightToScene(pointLight, true);
    });
    spotButton.addEventListener("click", function() {
      var spotLight = new THREE.SpotLight(0x00ff00, 2, 40, Math.PI / 6, 0.2, 1);
      spotLight.position.set(0, 10, 10);
      counter = lights.filter( o => {
        return o.name.includes("Spot Light");
      }).length;
      if (counter > 0) {
        spotLight.name = "Spot Light " + counter;
      } else {
        spotLight.name = "Spot Light";
      }
      addLightToScene(spotLight, true);
    })
    shadowsButton.addEventListener("click", function() {
      shadows = !shadows;
      updateShadows();
    });
    labelsButton.addEventListener("click", function() {
      labelsBackground.style.display = "block";
      labelsModal.style.display = "inline-block";
      labelsBackground.offsetHeight;
      labelsBackground.style.opacity = 1;
      labelsModal.offsetHeight;
      labelsModal.style.opacity = 1;
    });
    addLabelButton.addEventListener("click", function() {
      addLabel(0, 0);
    });
    deleteLabelButton.addEventListener("click", function() {
      if (labelBoxes.length > 0) {
        labelsContainer.removeChild(labelsContainer.children[labelBoxes.length - 1]);
        labelBoxes.pop();
        labelBoxCoordinates.pop();
      }
    });
    labelsBackground.addEventListener("click", function() {
      labelsBackground.style.opacity = 0;
      labelsModal.style.opacity = 0;
      labelsBackground.addEventListener("transitionend", hideLabels);
    });
  }

  function updateShadows() {
    if (shadows) {
      shadowsButton.classList.remove("wide-inactive");
      shadowsButton.classList.add("wide-active");
      shadowsButton.innerHTML = "Shadows Enabled";
    } else {
      shadowsButton.classList.remove("wide-active");
      shadowsButton.classList.add("wide-inactive");
      shadowsButton.innerHTML = "Shadows Disabled";
    }
    renderer.shadowMap.enabled = shadows;
    for (var i = 0; i < objects.length; i++) {
      objects[i].castShadow = shadows;
      objects[i].receiveShadow = shadows;
    }
    for (var i = 0; i < lights.length; i++) {
      var light = lights[i].light;
      if (!light.isAmbientLight && !light.isHemisphereLight) {
        light.castShadow = shadows;
      }
    }
  }

  function updateShading(flatShading) {
    if (flatShading) {
      shadingButton.classList.remove("wide-active");
      shadingButton.classList.add("wide-inactive");
      shadingButton.innerHTML = "Flat Shading";
    } else {
      shadingButton.classList.remove("wide-inactive");
      shadingButton.classList.add("wide-active");
      shadingButton.innerHTML = "Smooth Shading";
    }
  }

  function updateWireframe(wireframe) {
    if (wireframe) {
      wireframeButton.classList.remove("wide-inactive");
      wireframeButton.classList.add("wide-active");
      wireframeButton.innerHTML = "Wireframe Enabled";
    } else {
      wireframeButton.classList.remove("wide-active");
      wireframeButton.classList.add("wide-inactive");
      wireframeButton.innerHTML = "Wireframe Disabled";
    }
  }

  function updateCollision(collide) {
    if (collide) {
      collisionButton.classList.remove("wide-inactive");
      collisionButton.classList.add("wide-active");
      collisionButton.innerHTML = "Collision Enabled";
    } else {
      collisionButton.classList.remove("wide-active");
      collisionButton.classList.add("wide-inactive");
      collisionButton.innerHTML = "Collision Disabled";
    }
  }

  function updateObjectType(soft) {
    if (soft) {
      objectTypeButton.classList.remove("wide-inactive");
      objectTypeButton.classList.add("wide-active");
      objectTypeButton.innerHTML = "Soft Object";
      parameterWrapper3.style.display = "none";
      parameterWrapper4.style.display = "block";
      parameterWrapper6.style.display = "none";
    } else {
      objectTypeButton.classList.remove("wide-active");
      objectTypeButton.classList.add("wide-inactive");
      objectTypeButton.innerHTML = "Rigid Object";
      parameterWrapper3.style.display = "block";
      parameterWrapper4.style.display = "none";
      parameterWrapper6.style.display = "block";
    }
  }

  function addLabel(left, top) {
    var labelBox = document.createElement("div");
    var labelBoxX;
    var labelBoxY;
    labelBox.classList.add("label-box");
    labelBoxes.push(labelBox);
    labelBoxCoordinates.push([left, top]);
    labelBox.style.left = left + "px";
    labelBox.style.top = top + "px";
    labelBox.innerHTML ="Label " + labelBoxes.length;
    labelsContainer.appendChild(labelBox);
    labelBox.addEventListener("mousedown", function(event) {
      labelBoxX = event.clientX - labelBox.offsetLeft;
      labelBoxY = event.clientY - labelBox.offsetTop;
      window.addEventListener("mousemove", labelMove);
      window.addEventListener("mouseup", updateCoordinates);
    });
    function labelMove(event) {
      labelBox.style.left = Math.max(Math.min(event.clientX - labelBoxX, labelsContainer.offsetWidth - labelBox.offsetWidth), 0) + "px";
      labelBox.style.top = Math.max(Math.min(event.clientY - labelBoxY, labelsContainer.offsetHeight - labelBox.offsetHeight), 0) + "px";
    }
    function updateCoordinates() {
      window.removeEventListener("mousemove", labelMove);
      labelBoxCoordinates[labelBoxes.indexOf(labelBox)][0] = labelBox.offsetLeft;
      labelBoxCoordinates[labelBoxes.indexOf(labelBox)][1] = labelBox.offsetTop;
      window.removeEventListener("mouseup", updateCoordinates);
    }
  }

  function hideLabels() {
    labelsBackground.style.display = "none";
    labelsModal.style.display = "none";
    this.removeEventListener("transitionend", hideLabels);
  }

  function setOtherParameters(object) {
    object.opacity = 1;
    object.textureURL = "";
    object.mass = 10;
    object.linearVelocityX = 0;
    object.linearVelocityY = 0;
    object.linearVelocityZ = 0;
    object.angularVelocityX = 0;
    object.angularVelocityY = 0;
    object.angularVelocityZ = 0;
    object.pressure = 250;
    object.friction = 0.5;
    object.restitution = 0;
    object.collision = true;
    object.soft = false;
  }

  function findObjectById(objectId) {
    return objects.filter(function(o) {
      return o.uuid == objectId;
    })[0];
  };

  function removeParent(parent, child) {
    child.parent = parent.parent;
  }

  function parentInObjectList(object) {
    return (objects.filter(function(o) {
      return o.uuid == object.parent.uuid;
    }).length == 1);
  }

  function countAncestors(object, counter) {
    if (object.children.length != 0) {
      counter += object.children.length;
      object.children.forEach( c => {
        counter = countAncestors(c, counter);
      });
    }
    return counter;
  }

  function addToObjectList(object) {
    var objectDiv = document.createElement("div");
    objectDiv.classList.add("list-item");
    objectDiv.classList.add("list-inactive");
    objectDiv.setAttribute("draggable", true);
    objectDiv.id = object.uuid;

    console.log(object);

    if (parentInObjectList(object)) {
      console.log()
      var parentPadding = parseInt(document.getElementById(object.parent.uuid).style.paddingLeft);
      if (parentPadding) {
        objectDiv.style.paddingLeft = (parentPadding + 10) + "px";
      } else {
        objectDiv.style.paddingLeft = "10px";
      }
    }

    objectDiv.addEventListener( 'drag', function(e) {
      CURRENTDRAG = this;
    }, false );
    objectDiv.addEventListener( 'dragstart', function(e) {
      console.log("drag started");
    }, false ); // Firefox needs this

    objectDiv.addEventListener( 'dragover', function(e) {
      e.preventDefault();
      if (this === CURRENTDRAG) return;

      var area = e.offsetY / this.clientHeight;

      if ( area < 0.25 ) {
        this.className = 'list-item list-inactive dragTop';
      } else if ( area > 0.75 ) {
        this.className = 'list-item list-inactive dragBottom';
      } else {
        this.className = 'list-item list-inactive drag';
      }
      e.dataTransfer.dropEffect = 'copy';
    }, false );

    objectDiv.addEventListener( 'dragleave', function (e) {
      if (this === CURRENTDRAG ) return;
      this.className = 'list-item list-inactive';
    }, false );

    objectDiv.addEventListener( 'drop', function (e) {
      if (this === CURRENTDRAG) return;
      this.className = "list-item list-inactive";
      var area = e.offsetY / this.clientHeight;
      var currentDragObject = findObjectById(CURRENTDRAG.id);
      var parentObject = findObjectById(this.id);
      var currentObjectIndex = objects.indexOf(currentDragObject);
      var parentObjectIndex = objects.indexOf(parentObject);
      var paddingValue = parseInt(this.style.paddingLeft);
      var currentPadding, newObjectList;;
      var objectArray = Array.from(objectList.children)
      var numAncestors = countAncestors(currentDragObject, 0);
      var move = objectArray.slice(currentObjectIndex, (currentObjectIndex+numAncestors+1));
      //When hitting the top portion of the drag drop
      if (area < 0.25) {
        if (currentObjectIndex < parentObjectIndex && currentObjectIndex + numAncestors + 1 > parentObjectIndex) {
          return ;
        }

        if (paddingValue) {
          CURRENTDRAG.style.paddingLeft = paddingValue + "px";
        } else {
          CURRENTDRAG.style.paddingLeft = "";
        }

        move.forEach( (d, i) => {
          if (i != 0) {
            currentPadding = parseInt(document.getElementById(findObjectById(d.id).parent.uuid).style.paddingLeft)
            if (currentPadding) {
              d.style.paddingLeft = (currentPadding + 10) + "px";
            } else {
              d.style.paddingLeft = "10px";
            }
          }
        });

        if (currentObjectIndex < parentObjectIndex) {
          newObjectList = objectArray.slice(0, currentObjectIndex).concat(objectArray.slice(currentObjectIndex+numAncestors+1, parentObjectIndex), move, objectArray.slice(parentObjectIndex));
        } else {
          newObjectList = objectArray.slice(0, parentObjectIndex).concat(move, objectArray.slice(parentObjectIndex, currentObjectIndex), objectArray.slice(currentObjectIndex+numAncestors+1));
        }
        objectList.empty;
        newObjectList.forEach( o => {
          objectList.appendChild(o);
        });
        parentObject.parent.add(currentDragObject);
      //When hitting the Bottom portion
      } else if (area > 0.75) {
        if (currentObjectIndex < parentObjectIndex && currentObjectIndex + numAncestors + 1 > parentObjectIndex || countAncestors(parentObject, 0) > 0) {
          return ;
        }

        CURRENTDRAG.style.paddingLeft = "";

        move.forEach( (d, i) => {
          if (i != 0) {
            currentPadding = parseInt(document.getElementById(findObjectById(d.id).parent.uuid).style.paddingLeft)
            if (currentPadding) {
              d.style.paddingLeft = (currentPadding + 10) + "px";
            } else {
              d.style.paddingLeft = "10px";
            }
          }
        });

        if (currentObjectIndex < parentObjectIndex) {
          newObjectList = objectArray.slice(0, currentObjectIndex).concat(objectArray.slice(currentObjectIndex+numAncestors+1, parentObjectIndex+1), move, objectArray.slice(parentObjectIndex+1));
        } else {
          newObjectList = objectArray.slice(0, parentObjectIndex+1).concat(move, objectArray.slice(parentObjectIndex+1, currentObjectIndex), objectArray.slice(currentObjectIndex+numAncestors+1));
        }
        objectList.empty;
        newObjectList.forEach( o => {
          objectList.appendChild(o);
        });
        parentObject.parent.add(currentDragObject);
      } else {
        if (paddingValue) {
          paddingValue += 10;
          CURRENTDRAG.style.paddingLeft = paddingValue + "px";
        } else {
          CURRENTDRAG.style.paddingLeft = "10px";
        }

        move.forEach( (d, i) => {
          if (i != 0) {
            currentPadding = parseInt(document.getElementById(findObjectById(d.id).parent.uuid).style.paddingLeft)
            if (currentPadding) {
              d.style.paddingLeft = (currentPadding + 10) + "px";
            } else {
              d.style.paddingLeft = "10px";
            }
          }
        });
        if (currentObjectIndex < parentObjectIndex) {
          newObjectList = objectArray.slice(0, currentObjectIndex).concat(objectArray.slice(currentObjectIndex+numAncestors+1, parentObjectIndex+1), move, objectArray.slice(parentObjectIndex+1));
        } else {
          newObjectList = objectArray.slice(0, parentObjectIndex+1).concat(move, objectArray.slice(parentObjectIndex+1, currentObjectIndex), objectArray.slice(currentObjectIndex+numAncestors+1));
        }
        objectList.empty;
        newObjectList.forEach( o => {
          objectList.appendChild(o);
        });
        parentObject.add(currentDragObject);
      }
      syncObjectList();
    }, false );

    objectDiv.innerHTML = object.name;
    objectList.appendChild(objectDiv);
    objectDiv.addEventListener("click", function(e) {
      objectDiv.classList.remove("list-inactive");
      objectDiv.classList.add("list-active");
      if (selectedObjectDiv && selectedObjectDiv != [objectDiv]) {
        selectedObjectDiv.forEach(function(c) {
          c.classList.remove("list-active");
          c.classList.add("list-inactive");
        });
      }
      if (selectedLightDiv) {
        selectedLightDiv.classList.remove("list-active");
        selectedLightDiv.classList.add("list-inactive");
        selectedLightDiv = null;
      }
      selectedObjectDiv = [objectDiv];
      if (!trsEnabled) {
        enableTRS();
      }
      transformControls.attach(object);
      CLICKED = object;
      updateVisibility();
      addObjectSpecificParameters();
      updateInputs();
    });
    objectDiv.addEventListener("dblclick", function() {
      makeEditable(objectDiv);
    });
    objectDiv.addEventListener("keydown", function(event) {
      if (event.keyCode === 13/*Enter*/) {
        objectDiv.blur();
      }
    });
    objectDiv.addEventListener("blur", function() {
      if (objectDiv.innerHTML === "") {
        objectDiv.innerHTML = "Object";
      }
      object.name = objectDiv.innerHTML;
      objectDiv.contentEditable = false;
    });
  }

  function addToLightList(lightHelper) {
    var lightDiv = document.createElement("div");
    lightDiv.classList.add("list-item");
    lightDiv.classList.add("list-inactive");
    lightDiv.innerHTML = lightHelper.light.name;
    lightList.appendChild(lightDiv);
    lightDiv.addEventListener("click", function() {
      lightDiv.classList.remove("list-inactive");
      lightDiv.classList.add("list-active");
      if (selectedLightDiv && selectedLightDiv != lightDiv) {
        selectedLightDiv.classList.remove("list-active");
        selectedLightDiv.classList.add("list-inactive");
      }
      if (selectedObjectDiv) {
        selectedObjectDiv.forEach(function(c) {
          c.classList.remove("list-active");
          c.classList.add("list-inactive");
        });
        selectedObjectDiv = null;
      }
      selectedLightDiv = lightDiv;
      if (trsEnabled) {
        disableRS();
      }
      if (!lightHelper.light.isAmbientLight) {
        transformControls.attach(lightHelper.light);
      } else {
        transformControls.detach();
      }
      CLICKED = lightHelper;
      updateVisibility();
      addLightSpecificParameters();
      updateInputs();
    });
    lightDiv.addEventListener("dblclick", function() {
      makeEditable(lightDiv);
    });
    lightDiv.addEventListener("keydown", function(event) {
      if (event.keyCode === 13/*Enter*/) {
        lightDiv.blur();
      }
    });
    lightDiv.addEventListener("blur", function() {
      if (lightDiv.innerHTML === "") {
        lightDiv.innerHTML = "Light";
      }
      lightHelper.light.name = lightDiv.innerHTML;
      lightDiv.contentEditable = false;
    });
  }

  function makeEditable(objectDiv) {
    objectDiv.contentEditable = true;
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(objectDiv.childNodes[0], objectDiv.childNodes[0].length);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function initParameterControls() {
    backgroundColorInput.addEventListener("input", function() {
      //renderer.setClearColor(new THREE.Color(backgroundColorInput.value));// <--crash?
      //console.log(backgroundColorInput.value);
    });
    backgroundTextureInput.addEventListener("focus", function() {
      updateDropdown(backgroundTextureInput);
    });
    backgroundTextureInput.addEventListener("change", function() {
      updateParameters(backgroundTextureInput, "backgroundtexture");
    });
    addParameterListeners(gravityXInput, "world");
    addParameterListeners(gravityYInput, "world");
    addParameterListeners(gravityZInput, "world");
    addParameterListeners(cameraXInput, "world");
    addParameterListeners(cameraYInput, "world");
    addParameterListeners(cameraZInput, "world");
    addParameterListeners(targetXInput, "world");
    addParameterListeners(targetYInput, "world");
    addParameterListeners(targetZInput, "world");
    addParameterListeners(cameraFOVInput, "world");
    addParameterListeners(objectPositionXInput, "objectpositionx");
    addParameterListeners(objectPositionYInput, "objectpositiony");
    addParameterListeners(objectPositionZInput, "objectpositionz");
    addParameterListeners(objectRotationXInput, "objectrotationx");
    addParameterListeners(objectRotationYInput, "objectrotationy");
    addParameterListeners(objectRotationZInput, "objectrotationz");
    addParameterListeners(scaleXInput, "scalex");
    addParameterListeners(scaleYInput, "scaley");
    addParameterListeners(scaleZInput, "scalez");
    objectColorInput.addEventListener("input", function() {
      if (CLICKED) {
        CLICKED.material.color = new THREE.Color(objectColorInput.value);
      }
    });
    addParameterListeners(opacityInput, "opacity");
    objectTextureInput.addEventListener("focus", function() {
      updateDropdown(objectTextureInput);
      objectTextureInput.value = CLICKED.textureURL;
    });
    objectTextureInput.addEventListener("change", function() {
      updateParameters(objectTextureInput, "objecttexture");
    });
    addParameterListeners(massInput, "mass");
    addParameterListeners(linearVelocityXInput, "linearvelocityx");
    addParameterListeners(linearVelocityYInput, "linearvelocityy");
    addParameterListeners(linearVelocityZInput, "linearvelocityz");
    addParameterListeners(angularVelocityXInput, "angularvelocityx");
    addParameterListeners(angularVelocityYInput, "angularvelocityy");
    addParameterListeners(angularVelocityZInput, "angularvelocityz");
    addParameterListeners(pressureInput, "pressure");
    addParameterListeners(frictionInput, "friction");
    addParameterListeners(restitutionInput, "restitution");
    shadingButton.addEventListener("click", function() {
      if (CLICKED.textureURL === "") {
        updateMaterial(new THREE.MeshPhongMaterial({color: CLICKED.material.color.getHex(), flatShading: !CLICKED.material.flatShading, side: THREE.DoubleSide, wireframe: CLICKED.material.wireframe}), CLICKED.material.opacity);
      } else {
        var texture = new THREE.TextureLoader().load(getTextureURL(CLICKED.textureURL));
        updateMaterial(new THREE.MeshPhongMaterial({color: CLICKED.material.color.getHex(), map: texture, flatShading: !CLICKED.material.flatShading, side: THREE.DoubleSide, wireframe: CLICKED.material.wireframe}), CLICKED.material.opacity);
      }
      updateShading(CLICKED.material.flatShading);
    });
    wireframeButton.addEventListener("click", function() {
      CLICKED.material.wireframe = !CLICKED.material.wireframe;
      updateWireframe(CLICKED.material.wireframe);
    });
    collisionButton.addEventListener("click", function() {
      CLICKED.collision = !CLICKED.collision;
      updateCollision(CLICKED.collision);
    });
    objectTypeButton.addEventListener("click", function() {
      CLICKED.soft = !CLICKED.soft;
      if (CLICKED.geometry.type === "BoxBufferGeometry") {
        if (CLICKED.soft) {
          var segments = 8;
        } else {
          var segments = 1;
        }
        document.getElementById("box-width-segments").value = segments;
        document.getElementById("box-height-segments").value = segments;
        document.getElementById("box-depth-segments").value = segments;
        updateGeometry(new THREE.BoxBufferGeometry(CLICKED.geometry.parameters.width, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.depth, segments, segments, segments));
      }
      updateObjectType(CLICKED.soft);
    });
  }

  function addParameterListeners(input, clickedValue) {
    input.addEventListener("keydown", function(event) {
      if (event.keyCode === 13/*Enter*/) {
        input.blur();
      }
    });
    input.addEventListener("blur", function() {
      updateParameters(input, clickedValue);
    });
  }

  function updateParameters(input, clickedValue) {
    if (!CLICKED && clickedValue !== "backgroundtexture" && clickedValue !== "world") {
      return;
    }
    if (input.value === "" && clickedValue !== "objecttexture" && clickedValue != "backgroundtexture") {
      input.value = (0).toFixed(3);
    }
    if (clickedValue === "boxwidthsegments" || clickedValue === "boxheightsegments" || clickedValue === "boxdepthsegments" || clickedValue === "coneradialsegments" || clickedValue === "cylinderradialsegments" || clickedValue === "spherewidthsegments" || clickedValue === "sphereheightsegments") {
      input.value = Math.abs(input.valueAsNumber.toFixed());
    } else if (clickedValue === "opacity" || clickedValue === "mass" || clickedValue === "pressure" || clickedValue === "friction" || clickedValue === "restitution" || clickedValue === "intensity" || clickedValue === "distance" || clickedValue === "angle" || clickedValue === "penumbra" || clickedValue === "decay") {
      input.value = Math.abs(input.valueAsNumber).toFixed(3);
    } else if (clickedValue !== "objecttexture" && clickedValue !== "backgroundtexture") {
      input.value = input.valueAsNumber.toFixed(3);
    }
    switch (clickedValue) {
      case "backgroundtexture":
        if (input.value === "") {
          equirectMaterial.uniforms["tEquirect"].value = null;
          renderer.autoClear = true;
        } else {
          var equirectTexture = new THREE.TextureLoader().load(getTextureURL(input.value));
          equirectTexture.mapping = THREE.EquirectangularReflectionMapping;
          equirectMaterial.uniforms["tEquirect"].value = equirectTexture;
          renderer.autoClear = false;
        }
        break;
      case "objectpositionx":
        CLICKED.position.x = input.valueAsNumber;
        break;
      case "objectpositiony":
        CLICKED.position.y = input.valueAsNumber;
        break;
      case "objectpositionz":
        CLICKED.position.z = input.valueAsNumber;
        break;
      case "objectrotationx":
        CLICKED.rotation.x = input.valueAsNumber * Math.PI / 180;
        break;
      case "objectrotationy":
        CLICKED.rotation.y = input.valueAsNumber * Math.PI / 180;
        break;
      case "objectrotationz":
        CLICKED.rotation.z = input.valueAsNumber * Math.PI / 180;
        break;
      case "scalex":
        CLICKED.scale.x = input.valueAsNumber;
        break;
      case "scaley":
        CLICKED.scale.y = input.valueAsNumber;
        break;
      case "scalez":
        CLICKED.scale.z = input.valueAsNumber;
        break;
      case "opacity":
        CLICKED.material.opacity = input.valueAsNumber;
        if (CLICKED.material.opacity < 1) {
          CLICKED.material.transparent = true;
        } else {
          CLICKED.material.transparent = false;
        }
        break;
      case "objecttexture":
        CLICKED.textureURL = input.value;
        if (input.value === "") {
          updateMaterial(new THREE.MeshPhongMaterial({color: CLICKED.material.color.getHex(), flatShading: CLICKED.material.flatShading, side: THREE.DoubleSide, wireframe: CLICKED.material.wireframe}), CLICKED.material.opacity);
        } else {
          var texture = new THREE.TextureLoader().load(getTextureURL(input.value));
          updateMaterial(new THREE.MeshPhongMaterial({color: CLICKED.material.color.getHex(), map: texture, flatShading: CLICKED.material.flatShading, side: THREE.DoubleSide, wireframe: CLICKED.material.wireframe}), CLICKED.material.opacity);
        }
        break;
      case "mass":
        CLICKED.mass = input.valueAsNumber;
        break;
      case "boxwidth":
        updateGeometry(new THREE.BoxBufferGeometry(input.valueAsNumber, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.depth, CLICKED.geometry.parameters.widthSegments, CLICKED.geometry.parameters.heightSegments, CLICKED.geometry.parameters.depthSegments));
        break;
      case "boxheight":
        updateGeometry(new THREE.BoxBufferGeometry(CLICKED.geometry.parameters.width, input.valueAsNumber, CLICKED.geometry.parameters.depth, CLICKED.geometry.parameters.widthSegments, CLICKED.geometry.parameters.heightSegments, CLICKED.geometry.parameters.depthSegments));
        break;
      case "boxdepth":
        updateGeometry(new THREE.BoxBufferGeometry(CLICKED.geometry.parameters.width, CLICKED.geometry.parameters.height, input.valueAsNumber, CLICKED.geometry.parameters.widthSegments, CLICKED.geometry.parameters.heightSegments, CLICKED.geometry.parameters.depthSegments));
        break;
      case "boxwidthsegments":
        updateGeometry(new THREE.BoxBufferGeometry(CLICKED.geometry.parameters.width, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.depth, input.valueAsNumber, CLICKED.geometry.parameters.heightSegments, CLICKED.geometry.parameters.depthSegments));
        break;
      case "boxheightsegments":
        updateGeometry(new THREE.BoxBufferGeometry(CLICKED.geometry.parameters.width, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.depth, CLICKED.geometry.parameters.widthSegments, input.valueAsNumber, CLICKED.geometry.parameters.depthSegments));
        break;
      case "boxdepthsegments":
        updateGeometry(new THREE.BoxBufferGeometry(CLICKED.geometry.parameters.width, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.depth, CLICKED.geometry.parameters.widthSegments, CLICKED.geometry.parameters.heightSegments, input.valueAsNumber));
        break;
      case "coneradius":
        updateGeometry(new THREE.ConeBufferGeometry(input.valueAsNumber, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.radialSegments));
        break;
      case "coneheight":
        updateGeometry(new THREE.ConeBufferGeometry(CLICKED.geometry.parameters.radius, input.valueAsNumber, CLICKED.geometry.parameters.radialSegments));
        break;
      case "coneradialsegments":
        updateGeometry(new THREE.ConeBufferGeometry(CLICKED.geometry.parameters.radius, CLICKED.geometry.parameters.height, input.valueAsNumber));
        break;
      case "cylinderradiustop":
        updateGeometry(new THREE.CylinderBufferGeometry(input.valueAsNumber, CLICKED.geometry.parameters.radiusBottom, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.radialSegments));
        break;
      case "cylinderradiusbottom":
        updateGeometry(new THREE.CylinderBufferGeometry(CLICKED.geometry.parameters.radiusTop, input.valueAsNumber, CLICKED.geometry.parameters.height, CLICKED.geometry.parameters.radialSegments));
        break;
      case "cylinderheight":
        updateGeometry(new THREE.CylinderBufferGeometry(CLICKED.geometry.parameters.radiusTop, CLICKED.geometry.parameters.radiusBottom, input.valueAsNumber, CLICKED.geometry.parameters.radialSegments));
        break;
      case "cylinderradialsegments":
        updateGeometry(new THREE.CylinderBufferGeometry(CLICKED.geometry.parameters.radiusTop, CLICKED.geometry.parameters.radiusBottom, CLICKED.geometry.parameters.height, input.valueAsNumber));
        break;
      case "dodecahedronradius":
        updateGeometry(new THREE.DodecahedronBufferGeometry(input.valueAsNumber));
        break;
      case "icosahedronradius":
        updateGeometry(new THREE.IcosahedronBufferGeometry(input.valueAsNumber));
        break;
      case "octahedronradius":
        updateGeometry(new THREE.OctahedronBufferGeometry(input.valueAsNumber));
        break;
      case "sphereradius":
        updateGeometry(new THREE.SphereBufferGeometry(input.valueAsNumber, CLICKED.geometry.parameters.widthSegments, CLICKED.geometry.parameters.heightSegments));
        break;
      case "spherewidthsegments":
        updateGeometry(new THREE.SphereBufferGeometry(CLICKED.geometry.parameters.radius, input.valueAsNumber, CLICKED.geometry.parameters.heightSegments));
        break;
      case "sphereheightsegments":
        updateGeometry(new THREE.SphereBufferGeometry(CLICKED.geometry.parameters.radius, CLICKED.geometry.parameters.widthSegments, input.valueAsNumber));
        break;
      case "tetrahedronradius":
        updateGeometry(new THREE.TetrahedronBufferGeometry(input.valueAsNumber));
        break;
      case "linearvelocityx":
        CLICKED.linearVelocityX = input.valueAsNumber;
        break;
      case "linearvelocityy":
        CLICKED.linearVelocityY = input.valueAsNumber;
        break;
      case "linearvelocityz":
        CLICKED.linearVelocityZ = input.valueAsNumber;
        break;
      case "angularvelocityx":
        CLICKED.angularVelocityX = input.valueAsNumber;
        break;
      case "angularvelocityy":
        CLICKED.angularVelocityY = input.valueAsNumber;
        break;
      case "angularvelocityz":
        CLICKED.angularVelocityZ = input.valueAsNumber;
        break;
      case "pressure":
        CLICKED.pressure = input.valueAsNumber;
        break;
      case "friction":
        CLICKED.friction = input.valueAsNumber;
        break;
      case "restitution":
        CLICKED.restitution = input.valueAsNumber;
        break;
      case "lightpositionx":
        CLICKED.light.position.x = input.valueAsNumber;
        CLICKED.light.updateMatrixWorld();
        CLICKED.update();
        break;
      case "lightpositiony":
        CLICKED.light.position.y = input.valueAsNumber;
        CLICKED.light.updateMatrixWorld();
        CLICKED.update();
        break;
      case "lightpositionz":
        CLICKED.light.position.z = input.valueAsNumber;
        CLICKED.light.updateMatrixWorld();
        CLICKED.update();
        break;
      case "intensity":
        CLICKED.light.intensity = input.valueAsNumber;
        if (!CLICKED.light.isAmbientLight) {
          CLICKED.update();
        }
        break;
      case "distance":
        CLICKED.light.distance = input.valueAsNumber;
        CLICKED.update();
        break;
      case "angle":
        CLICKED.light.angle = input.valueAsNumber;
        CLICKED.update();
        break;
      case "penumbra":
        CLICKED.light.penumbra = input.valueAsNumber;
        CLICKED.update();
        break;
      case "decay":
        CLICKED.light.decay = input.valueAsNumber;
        CLICKED.update();
        break;
      default:
        break;
    }
  }

  function updateGeometry(geometry) {
    CLICKED.geometry.dispose();
    CLICKED.geometry = geometry;
  }

  function updateMaterial(material, opacity) {
    CLICKED.material.dispose();
    CLICKED.material = material;
    CLICKED.material.opacity = opacity;
    if (CLICKED.material.opacity < 1) {
      CLICKED.material.transparent = true;
    } else {
      CLICKED.material.transparent = false;
    }
  }

  function addObjectSpecificParameters() {
    if (CLICKED.type == "Mesh") {
      switch (CLICKED.geometry.type) {
      case "BoxBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Width</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"box-width\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Height</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"box-height\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Depth</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"box-depth\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Width Segments</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"box-width-segments\" type=\"number\"></div></div>" +
        "<div class=\"parameter-label\">Height Segments</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"box-height-segments\" type=\"number\"></div></div>" +
        "<div class=\"parameter-label\">Depth Segments</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"box-depth-segments\" type=\"number\"></div></div>";
        var boxWidthInput = document.getElementById("box-width");
        var boxHeightInput = document.getElementById("box-height");
        var boxDepthInput = document.getElementById("box-depth");
        var boxWidthSegmentsInput = document.getElementById("box-width-segments");
        var boxHeightSegmentsInput = document.getElementById("box-height-segments");
        var boxDepthSegmentsInput = document.getElementById("box-depth-segments");
        boxWidthInput.value = CLICKED.geometry.parameters.width.toFixed(3);
        boxHeightInput.value = CLICKED.geometry.parameters.height.toFixed(3);
        boxDepthInput.value = CLICKED.geometry.parameters.depth.toFixed(3);
        boxWidthSegmentsInput.value = CLICKED.geometry.parameters.widthSegments.toFixed();
        boxHeightSegmentsInput.value = CLICKED.geometry.parameters.heightSegments.toFixed();
        boxDepthSegmentsInput.value = CLICKED.geometry.parameters.depthSegments.toFixed();
        addParameterListeners(boxWidthInput, "boxwidth");
        addParameterListeners(boxHeightInput, "boxheight");
        addParameterListeners(boxDepthInput, "boxdepth");
        addParameterListeners(boxWidthSegmentsInput, "boxwidthsegments");
        addParameterListeners(boxHeightSegmentsInput, "boxheightsegments");
        addParameterListeners(boxDepthSegmentsInput, "boxdepthsegments");
        break;
      case "ConeBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"cone-radius\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Height</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"cone-height\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Radial Segments</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"cone-radial-segments\" type=\"number\"></div></div>";
        var coneRadiusInput = document.getElementById("cone-radius");
        var coneHeightInput = document.getElementById("cone-height");
        var coneRadialSegmentsInput = document.getElementById("cone-radial-segments");
        coneRadiusInput.value = CLICKED.geometry.parameters.radius.toFixed(3);
        coneHeightInput.value = CLICKED.geometry.parameters.height.toFixed(3);
        coneRadialSegmentsInput.value = CLICKED.geometry.parameters.radialSegments.toFixed();
        addParameterListeners(coneRadiusInput, "coneradius");
        addParameterListeners(coneHeightInput, "coneheight");
        addParameterListeners(coneRadialSegmentsInput, "coneradialsegments");
        break;
      case "CylinderBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Top Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"cylinder-radius-top\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Bottom Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"cylinder-radius-bottom\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Height</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"cylinder-height\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Radial Segments</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"cylinder-radial-segments\" type=\"number\"></div></div>";
        var cylinderRadiusTopInput = document.getElementById("cylinder-radius-top");
        var cylinderRadiusBottomInput = document.getElementById("cylinder-radius-bottom");
        var cylinderHeightInput = document.getElementById("cylinder-height");
        var cylinderRadialSegmentsInput = document.getElementById("cylinder-radial-segments");
        cylinderRadiusTopInput.value = CLICKED.geometry.parameters.radiusTop.toFixed(3);
        cylinderRadiusBottomInput.value = CLICKED.geometry.parameters.radiusBottom.toFixed(3);
        cylinderHeightInput.value = CLICKED.geometry.parameters.height.toFixed(3);
        cylinderRadialSegmentsInput.value = CLICKED.geometry.parameters.radialSegments.toFixed();
        addParameterListeners(cylinderRadiusTopInput, "cylinderradiustop");
        addParameterListeners(cylinderRadiusBottomInput, "cylinderradiusbottom");
        addParameterListeners(cylinderHeightInput, "cylinderheight");
        addParameterListeners(cylinderRadialSegmentsInput, "cylinderradialsegments");
        break;
      case "DodecahedronBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"dodecahedron-radius\" type=\"number\" step=\"0.001\"></div></div>";
        var dodecahedronRadiusInput = document.getElementById("dodecahedron-radius");
        dodecahedronRadiusInput.value = CLICKED.geometry.parameters.radius.toFixed(3);
        addParameterListeners(dodecahedronRadiusInput, "dodecahedronradius");
        break;
      case "IcosahedronBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"icosahedron-radius\" type=\"number\" step=\"0.001\"></div></div>";
        var icosahedronRadiusInput = document.getElementById("icosahedron-radius");
        icosahedronRadiusInput.value = CLICKED.geometry.parameters.radius.toFixed(3);
        addParameterListeners(icosahedronRadiusInput, "icosahedronradius");
        break;
      case "OctahedronBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"octahedron-radius\" type=\"number\" step=\"0.001\"></div></div>";
        var octahedronRadiusInput = document.getElementById("octahedron-radius");
        octahedronRadiusInput.value = CLICKED.geometry.parameters.radius.toFixed(3);
        addParameterListeners(octahedronRadiusInput, "octahedronradius");
        break;
      case "SphereBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"sphere-radius\" type=\"number\" step=\"0.001\"></div></div>" +
        "<div class=\"parameter-label\">Width Segments</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"sphere-width-segments\" type=\"number\"></div></div>" +
        "<div class=\"parameter-label\">Height Segments</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"sphere-height-segments\" type=\"number\"></div></div>";
        var sphereRadiusInput = document.getElementById("sphere-radius");
        var sphereWidthSegmentsInput = document.getElementById("sphere-width-segments");
        var sphereHeightSegmentsInput = document.getElementById("sphere-height-segments");
        sphereRadiusInput.value = CLICKED.geometry.parameters.radius.toFixed(3);
        sphereWidthSegmentsInput.value = CLICKED.geometry.parameters.widthSegments.toFixed();
        sphereHeightSegmentsInput.value = CLICKED.geometry.parameters.heightSegments.toFixed();
        addParameterListeners(sphereRadiusInput, "sphereradius");
        addParameterListeners(sphereWidthSegmentsInput, "spherewidthsegments");
        addParameterListeners(sphereHeightSegmentsInput, "sphereheightsegments");
        break;
      case "TetrahedronBufferGeometry":
        parameterWrapper2.innerHTML = "<div class=\"parameter-label\">Radius</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"tetrahedron-radius\" type=\"number\" step=\"0.001\"></div></div>";
        var tetrahedronRadiusInput = document.getElementById("tetrahedron-radius");
        tetrahedronRadiusInput.value = CLICKED.geometry.parameters.radius.toFixed(3);
        addParameterListeners(tetrahedronRadiusInput, "tetrahedronradius");
        break;
      default:
        console.log("parameter 2 none");
        parameterWrapper2.style.display = "none";
        parameterWrapper2.innerHTML = "";
        return;
      }
    }
    parameterWrapper2.style.display = "block";
    parameterWrapper7.innerHTML = "";
  }

  function addLightSpecificParameters() {
    if (CLICKED.light.isAmbientLight) {
      parameterWrapper7.innerHTML = "<hr><div class=\"parameter-label\">Color</div><div class=\"parameter-row\"><input class=\"color\" id=\"light-color\" type=\"color\"></div>" +
      "<div class=\"parameter-label\">Intensity</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"intensity\" type=\"number\" step=\"0.001\"></div></div>";
      var lightColorInput = document.getElementById("light-color");
      var intensityInput = document.getElementById("intensity");
      lightColorInput.value = "#" + CLICKED.light.color.getHexString();
      intensityInput.value = CLICKED.light.intensity.toFixed(3);
      lightColorInput.addEventListener("input", function() {
        if (CLICKED) {
          CLICKED.light.color = new THREE.Color(lightColorInput.value);
        }
      });
      addParameterListeners(intensityInput, "intensity");
    } else if (CLICKED.light.isDirectionalLight) {
      parameterWrapper7.innerHTML = "<hr><div class=\"parameter-label\">Position</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-x\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-y\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-z\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Color</div><div class=\"parameter-row\"><input class=\"color\" id=\"light-color\" type=\"color\"></div>" +
      "<div class=\"parameter-label\">Intensity</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"intensity\" type=\"number\" step=\"0.001\"></div></div>";
      lightPositionXInput = document.getElementById("light-position-x");
      lightPositionYInput = document.getElementById("light-position-y");
      lightPositionZInput = document.getElementById("light-position-z");
      var lightColorInput = document.getElementById("light-color");
      var intensityInput = document.getElementById("intensity");
      lightPositionXInput.value = CLICKED.light.position.x.toFixed(3);
      lightPositionYInput.value = CLICKED.light.position.y.toFixed(3);
      lightPositionZInput.value = CLICKED.light.position.z.toFixed(3);
      lightColorInput.value = "#" + CLICKED.light.color.getHexString();
      intensityInput.value = CLICKED.light.intensity.toFixed(3);
      addParameterListeners(lightPositionXInput, "lightpositionx");
      addParameterListeners(lightPositionYInput, "lightpositiony");
      addParameterListeners(lightPositionZInput, "lightpositionz");
      lightColorInput.addEventListener("input", function() {
        if (CLICKED) {
          CLICKED.light.color = new THREE.Color(lightColorInput.value);
          CLICKED.update();
        }
      });
      addParameterListeners(intensityInput, "intensity");
    } else if (CLICKED.light.isHemisphereLight) {
      parameterWrapper7.innerHTML = "<hr><div class=\"parameter-label\">Position</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-x\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-y\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-z\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Sky Color</div><div class=\"parameter-row\"><input class=\"color\" id=\"light-sky-color\" type=\"color\"></div>" +
      "<div class=\"parameter-label\">Ground Color</div><div class=\"parameter-row\"><input class=\"color\" id=\"light-ground-color\" type=\"color\"></div>" +
      "<div class=\"parameter-label\">Intensity</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"intensity\" type=\"number\" step=\"0.001\"></div></div>";
      lightPositionXInput = document.getElementById("light-position-x");
      lightPositionYInput = document.getElementById("light-position-y");
      lightPositionZInput = document.getElementById("light-position-z");
      var lightSkyColorInput = document.getElementById("light-sky-color");
      var lightGroundColorInput = document.getElementById("light-ground-color");
      var intensityInput = document.getElementById("intensity");
      lightPositionXInput.value = CLICKED.light.position.x.toFixed(3);
      lightPositionYInput.value = CLICKED.light.position.y.toFixed(3);
      lightPositionZInput.value = CLICKED.light.position.z.toFixed(3);
      lightSkyColorInput.value = "#" + CLICKED.light.color.getHexString();
      lightGroundColorInput.value = "#" + CLICKED.light.groundColor.getHexString();
      intensityInput.value = CLICKED.light.intensity.toFixed(3);
      addParameterListeners(lightPositionXInput, "lightpositionx");
      addParameterListeners(lightPositionYInput, "lightpositiony");
      addParameterListeners(lightPositionZInput, "lightpositionz");
      lightSkyColorInput.addEventListener("input", function() {
        if (CLICKED) {
          CLICKED.light.color = new THREE.Color(lightSkyColorInput.value);
          CLICKED.update();
        }
      });
      lightGroundColorInput.addEventListener("input", function() {
        if (CLICKED) {
          CLICKED.light.groundColor = new THREE.Color(lightGroundColorInput.value);
          CLICKED.update();
        }
      });
      addParameterListeners(intensityInput, "intensity");
    } else if (CLICKED.light.isPointLight) {
      parameterWrapper7.innerHTML = "<hr><div class=\"parameter-label\">Position</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-x\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-y\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-z\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Color</div><div class=\"parameter-row\"><input class=\"color\" id=\"light-color\" type=\"color\"></div>" +
      "<div class=\"parameter-label\">Intensity</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"intensity\" type=\"number\" step=\"0.001\"></div></div>";
      lightPositionXInput = document.getElementById("light-position-x");
      lightPositionYInput = document.getElementById("light-position-y");
      lightPositionZInput = document.getElementById("light-position-z");
      var lightColorInput = document.getElementById("light-color");
      var intensityInput = document.getElementById("intensity");
      lightPositionXInput.value = CLICKED.light.position.x.toFixed(3);
      lightPositionYInput.value = CLICKED.light.position.y.toFixed(3);
      lightPositionZInput.value = CLICKED.light.position.z.toFixed(3);
      lightColorInput.value = "#" + CLICKED.light.color.getHexString();
      intensityInput.value = CLICKED.light.intensity.toFixed(3);
      addParameterListeners(lightPositionXInput, "lightpositionx");
      addParameterListeners(lightPositionYInput, "lightpositiony");
      addParameterListeners(lightPositionZInput, "lightpositionz");
      lightColorInput.addEventListener("input", function() {
        if (CLICKED) {
          CLICKED.light.color = new THREE.Color(lightColorInput.value);
          CLICKED.update();
        }
      });
      addParameterListeners(intensityInput, "intensity");
    } else if (CLICKED.light.isSpotLight) {
      parameterWrapper7.innerHTML = "<hr><div class=\"parameter-label\">Position</div><div class=\"row parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-x\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-y\" type=\"number\" step=\"0.001\"></div>" +
      "<div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"light-position-z\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Color</div><div class=\"parameter-row\"><input class=\"color\" id=\"light-color\" type=\"color\"></div>" +
      "<div class=\"parameter-label\">Intensity</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"intensity\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Distance</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"distance\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Angle</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"angle\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Penumbra</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"penumbra\" type=\"number\" step=\"0.001\"></div></div>" +
      "<div class=\"parameter-label\">Decay</div><div class=\"parameter-row\"><div class=\"col-4 parameter-item\"><input class=\"input-text parameter-box\" id=\"decay\" type=\"number\" step=\"0.001\"></div></div>";
      lightPositionXInput = document.getElementById("light-position-x");
      lightPositionYInput = document.getElementById("light-position-y");
      lightPositionZInput = document.getElementById("light-position-z");
      var lightColorInput = document.getElementById("light-color");
      var intensityInput = document.getElementById("intensity");
      var distanceInput = document.getElementById("distance");
      var angleInput = document.getElementById("angle");
      var penumbraInput = document.getElementById("penumbra");
      var decayInput = document.getElementById("decay");
      lightPositionXInput.value = CLICKED.light.position.x.toFixed(3);
      lightPositionYInput.value = CLICKED.light.position.y.toFixed(3);
      lightPositionZInput.value = CLICKED.light.position.z.toFixed(3);
      lightColorInput.value = "#" + CLICKED.light.color.getHexString();
      intensityInput.value = CLICKED.light.intensity.toFixed(3);
      distanceInput.value = CLICKED.light.distance.toFixed(3);
      angleInput.value = CLICKED.light.angle.toFixed(3);
      penumbraInput.value = CLICKED.light.penumbra.toFixed(3);
      decayInput.value = CLICKED.light.decay.toFixed(3);
      addParameterListeners(lightPositionXInput, "lightpositionx");
      addParameterListeners(lightPositionYInput, "lightpositiony");
      addParameterListeners(lightPositionZInput, "lightpositionz");
      lightColorInput.addEventListener("input", function() {
        if (CLICKED) {
          CLICKED.light.color = new THREE.Color(lightColorInput.value);
          CLICKED.update();
        }
      });
      addParameterListeners(intensityInput, "intensity");
      addParameterListeners(distanceInput, "distance");
      addParameterListeners(angleInput, "angle");
      addParameterListeners(penumbraInput, "penumbra");
      addParameterListeners(decayInput, "decay");
    } else {
      console.log("parameter 7 none");
      parameterWrapper7.style.display = "none";
      parameterWrapper7.innerHTML = "";
      return;
    }
    parameterWrapper7.style.display = "block";
    parameterWrapper2.innerHTML = "";
  }

  function getTextureURL(texture) {
    if (typeof window.parent.getProjectIdString === "function") {
      return "/ode/download/file/" + window.parent.getProjectIdString() + "/assets/" + texture;
    } else {
      return texture;
    }
  }
}

var importScene;
var clearScene;
var generateSceneJSONString;

if (typeof window.parent.loadScene === "function") {
  window.parent.loadScene();
}