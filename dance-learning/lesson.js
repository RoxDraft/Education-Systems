
(async () => {
  const root=document.getElementById('dance-3d'), q=s=>root.querySelector(s);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let focus='brain',zoom=1,yaw=-.5,pitch=.2,speed=.25,selected='plan',playing=false,t=.3,last=0,started=0,raf=0,ready=false;
  let demo=true,demoStep=0,demoProgress=0;
  const steps=[
    {title:'วางแผนและเตรียมคำสั่ง',focus:'brain',part:'plan',detail:'เครือข่ายวางแผน → เครือข่ายสั่งการ: เตรียมก้าวถัดไป',early:'เริ่มฝึก: คิดลำดับและตำแหน่งแขนขาทีละส่วน จึงอาจลังเลก่อนเริ่ม',late:'คล่องแล้ว: เรียกใช้ลำดับที่ฝึกมาได้ต่อเนื่องขึ้น พึ่งการคิดกำกับรายละเอียดน้อยลง'},
    {title:'คำสั่งลงผ่านไขสันหลัง',focus:'nerves',part:'spinal',detail:'สมองสั่งการ → ทางลงผ่านก้านสมอง → วงจรสั่งการในไขสันหลัง',early:'เริ่มฝึก: คำสั่งลงมาสัมพันธ์กับแผนที่ยังต้องปรับ จังหวะทั้งท่าอาจไม่สม่ำเสมอ',late:'คล่องแล้ว: ประสานรูปแบบคำสั่งได้ดีขึ้น ไม่ได้หมายความว่าสัญญาณประสาททุกเส้นวิ่งเร็วขึ้น'},
    {title:'เส้นประสาทนำคำสั่งสู่กล้ามเนื้อ',focus:'nerves',part:'legNerve',detail:'วงจรไขสันหลัง → ประสาทสั่งการที่ขา → รอยต่อประสาทกับกล้ามเนื้อ',early:'เริ่มฝึก: เรียนรู้ว่าจะกระตุ้นกล้ามเนื้อใด เมื่อใด และแรงเท่าไร',late:'คล่องแล้ว: การกระตุ้นกล้ามเนื้อสัมพันธ์กับท่าได้แม่นขึ้น ใช้ทางส่งคำสั่งพื้นฐานเช่นเดิม'},
    {title:'กล้ามเนื้อออกแรงและขาเคลื่อน',focus:'muscle',part:'quad',detail:'เส้นใยกล้ามเนื้อออกแรง → ส่งแรงผ่านเอ็น → ข้อต่อเคลื่อนหรือทรงตัว',early:'เริ่มฝึก: อาจเกร็งกล้ามเนื้อคู่ตรงข้ามเกินจำเป็น ทำให้ท่าดูแข็งหรือสะดุด',late:'คล่องแล้ว: ประสานการออกแรงกับการยอมให้เคลื่อนไหวได้ดีขึ้น ยังต้องใช้พลังงาน'},
    {title:'ข้อมูลจากร่างกายย้อนกลับ',focus:'nerves',part:'sensory',detail:'ตัวรับในกล้ามเนื้อ เอ็น และข้อต่อ → ประสาทรับความรู้สึก → ไขสันหลังและสมอง',early:'เริ่มฝึก: ใช้ข้อมูลตำแหน่งและการเคลื่อนไหวเทียบกับท่าที่ตั้งใจ แล้วค่อยปรับ',late:'คล่องแล้ว: ยังรับข้อมูลย้อนกลับตลอด ร่วมกับการคาดการณ์ที่ฝึกมาดีขึ้น'},
    {title:'เปรียบเทียบผลและปรับก้าวต่อไป',focus:'brain',part:'cerebellum',detail:'ข้อมูลที่ได้ + ผลที่คาดไว้ → วงจรสมองน้อยและเครือข่ายอื่น → ปรับคำสั่งรอบถัดไป',early:'เริ่มฝึก: เมื่อผลไม่ตรงเป้าหมาย ต้องปรับท่าและเรียนรู้จากความคลาดเคลื่อน',late:'คล่องแล้ว: คาดการณ์ได้ดีขึ้น แต่ยังต้องแก้เมื่อพื้น จังหวะ หรือสมดุลเปลี่ยน'}
  ];
  const modes={
    body:{distance:3.3,detail:'ท่าและจังหวะเป้าหมายเดียวกัน · เมื่อคล่อง การประสานแขนขาต่อเนื่องขึ้น',captions:['กำกับทีละขั้น จังหวะอาจสะดุด และอาจเกร็งส่วนเกิน','เชื่อมท่าได้ต่อเนื่อง ยังคงปรับสมดุลและใช้ข้อมูลย้อนกลับ']},
    brain:{distance:.58,detail:'ซีกสมองโปร่งให้เห็นวงจรภายใน · ปมประสาทฐานและสมองน้อยทำงานร่วมกับเปลือกสมอง',captions:['บริเวณด้านหน้า: เครือข่ายใส่ใจและวางแผนร่วมกำกับรายละเอียด','การคิดกำกับลดลง วงจรสั่งการและการแก้ข้อผิดพลาดยังทำงาน']},
    nerves:{distance:2.85,detail:'เนื้อเยื่อโปร่งเพื่อเห็นเส้นประสาท · จุดคำสั่งลงสู่แขนขา จุดข้อมูลจากร่างกายย้อนกลับ',captions:['รับข้อมูลแล้วปรับท่าบ่อย ความเร็วของจุดวิ่งเป็นเพียงสัญลักษณ์','ยังมีข้อมูลย้อนกลับเช่นเดิม ความคล่องไม่ใช่การหยุดรับความรู้สึก']},
    muscle:{distance:1.65,detail:'คลิกหน้าขา หลังขา น่อง หรือเอ็นร้อยหวาย แล้วหมุนดูจุดที่ป้ายชี้',captions:['อาจเกร็งกล้ามเนื้อคู่ตรงข้ามเกินจำเป็นระหว่างหัดควบคุมท่า','ประสานการหดตัวได้ดีขึ้น แต่ยังต้องใช้พลังงานในการเต้น']},
    arms:{distance:1.05,detail:'ไบเซปส์และไตรเซปส์ช่วยควบคุมข้อศอก · คลิกป้ายเพื่อเปรียบเทียบ',captions:['อาจเกร็งทั้งด้านหน้าและด้านหลังแขนขณะหัดท่า','ปรับจังหวะการออกแรงให้สัมพันธ์กับท่าได้ดีขึ้น']}
  };
  const parts={
    plan:{label:'สมองส่วนหน้า',name:'เครือข่ายใส่ใจและวางแผนส่วนหน้า',focus:'brain',side:'left',role:'ช่วยคงเป้าหมาย ใส่ใจ และจัดลำดับท่า โดยทำงานร่วมกับสมองบริเวณอื่น',early:'ต้องคิดและทบทวนว่าท่าต่อไปคืออะไรบ่อย',late:'พึ่งการกำกับทีละขั้นลดลง แต่กลับมาใส่ใจมากขึ้นได้เมื่อท่าเปลี่ยน'},
    motor:{label:'สมองสั่งการ',name:'เปลือกสมองสั่งการเคลื่อนไหว',focus:'brain',side:'right',role:'ร่วมสร้างคำสั่งที่ควบคุมการทำงานของกล้ามเนื้อ ผ่านเส้นทางประสาทสั่งการ',early:'คำสั่งยังต้องปรับให้เข้ากับลำดับและความแม่นยำที่กำลังเรียน',late:'คำสั่งประสานกับวงจรอื่นเพื่อทำลำดับที่ฝึกมาได้ต่อเนื่อง'},
    basal:{label:'ปมประสาทฐาน',name:'ปมประสาทฐาน (basal ganglia)',focus:'brain',side:'left',role:'กลุ่มโครงสร้างส่วนลึกที่ร่วมเลือกการกระทำและเรียนรู้ลำดับการเคลื่อนไหว',early:'ร่วมเรียนรู้การเลือกท่าและลำดับที่เหมาะสม',late:'มีส่วนในลำดับการกระทำที่คุ้นเคย ร่วมกับเครือข่ายอื่น'},
    cerebellum:{label:'สมองน้อย',name:'สมองน้อย (cerebellum)',focus:'brain',side:'right',role:'ช่วยเรื่องจังหวะ การทรงตัว การคาดการณ์ และการเรียนรู้เพื่อปรับความคลาดเคลื่อนของท่า',early:'ผลที่เกิดยังต่างจากที่ต้องการ จึงต้องปรับการเคลื่อนไหวบ่อย',late:'คาดการณ์ผลได้แม่นขึ้น และยังแก้ท่าเมื่อเสียสมดุล'},
    spinal:{label:'ไขสันหลัง',name:'ไขสันหลัง',focus:'nerves',side:'left',role:'เป็นทางผ่านของสัญญาณระหว่างสมองกับร่างกาย และมีวงจรรีเฟล็กซ์ในตัว',early:'ส่งต่อคำสั่งและข้อมูลจากร่างกายระหว่างฝึกเช่นเดียวกับช่วงคล่อง',late:'ยังส่งข้อมูลทั้งสองทิศ ความคล่องไม่ใช่การเลิกใช้ไขสันหลัง'},
    armNerve:{label:'ประสาทแขน',name:'เส้นประสาทส่วนปลายที่แขน',focus:'nerves',side:'right',role:'มีใยประสาทที่นำคำสั่งสู่กล้ามเนื้อแขน และใยที่นำข้อมูลความรู้สึกกลับเข้า',early:'คำสั่งและข้อมูลย้อนกลับช่วยปรับตำแหน่งแขนที่ยังไม่คุ้น',late:'ยังสื่อสารสองทิศทาง แม้การประสานแขนคล่องขึ้น'},
    legNerve:{label:'ประสาทขา',name:'เส้นประสาทส่วนปลายที่ขา',focus:'nerves',side:'left',role:'นำคำสั่งไปยังกล้ามเนื้อขา และนำข้อมูลความรู้สึกจากขากลับเข้าสู่ระบบประสาทส่วนกลาง',early:'ช่วยให้ลองก้าวและปรับแรงตามข้อมูลที่ได้รับ',late:'ยังรับข้อมูลพื้นและตำแหน่งขาเพื่อรักษาสมดุล'},
    sensory:{label:'ทางรับความรู้สึก',name:'ทางนำข้อมูลความรู้สึกจากร่างกาย',focus:'nerves',side:'right',role:'นำข้อมูลจากกล้ามเนื้อ เอ็น และข้อต่อกลับเข้า ช่วยรับรู้ตำแหน่งและการเคลื่อนไหว; เส้นในภาพเป็นทางแทนโดยย่อ',early:'ใช้ข้อมูลนี้เทียบกับท่าที่ตั้งใจ แล้วแก้ตำแหน่ง',late:'ยังใช้ข้อมูลเดิมร่วมกับการคาดการณ์ ไม่ได้หยุดรับความรู้สึก'},
    biceps:{label:'ไบเซปส์',name:'ไบเซปส์ต้นแขน (biceps brachii)',focus:'arms',side:'left',role:'ช่วยงอข้อศอกและหงายปลายแขน โดยทำงานร่วมกับกล้ามเนื้ออื่น',early:'อาจเกร็งมากเกินหรือออกแรงไม่ตรงจังหวะ',late:'ปรับแรงให้สัมพันธ์กับท่าและกล้ามเนื้อด้านตรงข้ามได้ดีขึ้น'},
    triceps:{label:'ไตรเซปส์',name:'ไตรเซปส์ต้นแขน (triceps brachii)',focus:'arms',side:'right',role:'ช่วยเหยียดข้อศอก และทำงานประสานกับกล้ามเนื้อที่งอข้อศอก',early:'อาจเกร็งร่วมกับกล้ามเนื้องอมากเกินจำเป็น',late:'สลับและประสานการออกแรงกับกล้ามเนื้องอได้ดีขึ้น'},
    quad:{label:'หน้าขา',name:'กลุ่มกล้ามเนื้อหน้าขา (quadriceps)',focus:'muscle',side:'left',role:'ช่วยเหยียดเข่าและควบคุมการย่อเข่าขณะรับน้ำหนัก',early:'ยังหาจังหวะย่อและเหยียดเข่า อาจใช้แรงส่วนเกิน',late:'ควบคุมเข่าให้สัมพันธ์กับจังหวะและน้ำหนักตัวได้ดีขึ้น'},
    hamstring:{label:'หลังขา',name:'กลุ่มกล้ามเนื้อหลังขา (hamstrings)',focus:'muscle',side:'right',role:'ช่วยงอเข่า และส่วนใหญ่ช่วยเหยียดสะโพก ร่วมควบคุมการเคลื่อนไหวของขา',early:'กำลังเรียนรู้การประสานกับกล้ามเนื้อหน้าขา',late:'ประสานแรงงอและเหยียดในลำดับที่ฝึกได้คล่องขึ้น'},
    calf:{label:'น่อง',name:'กล้ามเนื้อน่อง (gastrocnemius และ soleus)',focus:'muscle',side:'left',role:'ช่วยกดปลายเท้าลง ยกส้น และควบคุมการทรงตัวผ่านข้อเท้า',early:'อาจยกส้นหรือถ่ายน้ำหนักไม่ตรงจังหวะ',late:'ถ่ายน้ำหนักและออกแรงผ่านข้อเท้าได้สม่ำเสมอขึ้น'},
    achilles:{label:'เอ็นร้อยหวาย',name:'เอ็นร้อยหวาย',focus:'muscle',side:'right',role:'ส่งแรงจากกล้ามเนื้อน่องไปยังกระดูกส้นเท้า เอ็นเองไม่ได้หดตัวแบบกล้ามเนื้อ',early:'ส่งแรงตามการออกแรงของน่องที่ยังปรับจังหวะอยู่',late:'ยังทำหน้าที่ส่งแรงเดิม ความคล่องมาจากการประสานระบบทั้งหมด'}
  };
  const labelSets={body:['plan','spinal','biceps','quad','calf'],brain:['plan','motor','basal','cerebellum'],nerves:['spinal','armNerve','legNerve','sensory'],muscle:['quad','hamstring','calf','achilles'],arms:['biceps','triceps']};
  let THREE;
  try {THREE=window.THREE;if(!THREE)throw new Error('renderer unavailable');}
  catch(e){q('#dt-detail').textContent='โหลดแบบจำลอง 3 มิติไม่สำเร็จ โปรดลองเปิดภาพนี้อีกครั้ง';q('#dt-detail').setAttribute('role','alert');return}
  const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z), Y=V(0,1,0);
  const sphere=new THREE.SphereGeometry(1,24,18), smallSphere=new THREE.SphereGeometry(1,12,10);
  let colors={};
  function getColors(){
    const probe=document.createElement('span');root.append(probe);
    for(const k of ['background','foreground','muted','red','yellow','viz-series-1','viz-series-2']){
      probe.style.color=`var(--${k})`;const v=getComputedStyle(probe).color;const c=document.createElement('canvas').getContext('2d');c.fillStyle=v;c.fillRect(0,0,1,1);const d=c.getImageData(0,0,1,1).data;colors[k]=new THREE.Color(d[0]/255,d[1]/255,d[2]/255).convertSRGBToLinear();
    }probe.remove();
  }
  getColors();
  const mix=(a,b,n)=>colors[a].clone().lerp(colors[b],n);
  const views=[],tmp=V();
  function build(skilled,index){
    const container=q('#dt-stage-'+index),canvas=container.querySelector('canvas');
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setClearColor(colors.background,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.01,30);
    const lightColor=colors.background.r+colors.background.g+colors.background.b>colors.foreground.r+colors.foreground.g+colors.foreground.b?colors.background:colors.foreground;
    scene.add(new THREE.AmbientLight(lightColor,.9));
    const key=new THREE.DirectionalLight(lightColor,2.0);key.position.set(-2,4,4);scene.add(key);
    const fill=new THREE.DirectionalLight(colors['viz-series-1'],.7);fill.position.set(3,2,-2);scene.add(fill);
    const materials={},muscles=[],nerves=[],signals=[],brainNodes=[],hemispheres=[],anatomy={};
    const mat=(kind,color,options={})=>{
      const m=new THREE.MeshStandardMaterial({color,roughness:.64,metalness:0,...options});(materials[kind]??=[]).push(m);return m;
    };
    const tissue=mat('muscle',mix('red','background',.2));
    const tendon=mat('bone',mix('foreground','background',.52));
    const neural=mat('nerve',colors['viz-series-1'],{emissive:colors['viz-series-1'],emissiveIntensity:.35});
    const feedback=mat('sensory',colors['viz-series-2'],{emissive:colors['viz-series-2'],emissiveIntensity:.3});
    const structure=mat('nervebase',mix('yellow','background',.25));
    const brainMat=mat('brain',mix('red','background',.5),{roughness:.86});
    const grooveMat=mat('groove',mix('red','foreground',.4),{roughness:.9});
    const skinMat=mat('skin',mix('foreground','background',.82),{transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
    const organMat=mat('organ',mix('red','background',.55),{transparent:true,opacity:.48,depthWrite:false});
    const rootGroup=new THREE.Group();scene.add(rootGroup);rootGroup.position.y=.95;
    const pelvis=new THREE.Group();rootGroup.add(pelvis);
    const torso=new THREE.Group();torso.position.y=.12;pelvis.add(torso);
    const ell=(parent,pos,scale,material,geo=sphere)=>{const mesh=new THREE.Mesh(geo,material);mesh.position.copy(pos);mesh.scale.copy(scale);parent.add(mesh);return mesh};
    function tube(parent,points,r,material,segments=30){const curve=new THREE.CatmullRomCurve3(points);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,r,5,false),material);parent.add(mesh);return {mesh,curve}}
    function between(parent,a,b,r,material){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,b.distanceTo(a),10),material);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(Y,b.clone().sub(a).normalize());parent.add(mesh);return mesh}
    const profile=[];for(let k=0;k<=20;k++){const u=k/20;profile.push(new THREE.Vector2(.09+.91*Math.pow(Math.sin(u*Math.PI),.8),u-.5))}
    const muscleGeometry=new THREE.LatheGeometry(profile,20);
    function muscle(parent,a,b,r,depth=1,phase=0){
      const group=new THREE.Group();group.position.copy(a).add(b).multiplyScalar(.5);group.quaternion.setFromUnitVectors(Y,b.clone().sub(a).normalize());parent.add(group);
      const len=a.distanceTo(b),m=mat('muscle',mix('red','background',.2));
      const mesh=new THREE.Mesh(muscleGeometry,m);mesh.scale.set(r,len,r*depth);group.add(mesh);
      for(let j=0;j<5;j++){
        const theta=j/5*Math.PI*2,pts=[];
        for(let k=1;k<15;k++){const u=k/15,rad=r*(.09+.92*Math.pow(Math.sin(u*Math.PI),.8));pts.push(V(Math.cos(theta)*rad,(u-.5)*len,Math.sin(theta)*rad*depth))}
        tube(group,pts,.0009,tendon,18);
      }
      between(parent,a,a.clone().lerp(b,.13),r*.12,tendon);between(parent,b,b.clone().lerp(a,.13),r*.12,tendon);
      muscles.push({mesh,base:r,depth,material:m,phase});return mesh;
    }
    function nervePath(parent,points,offset=.009){
      const a=tube(parent,points,.003,neural),pts=points.map(p=>p.clone().add(V(offset,0,.003))),b=tube(parent,pts,.0021,feedback);
      const dotA=ell(parent,V(),V(.006,.006,.006),neural,smallSphere),dotB=ell(parent,V(),V(.005,.005,.005),feedback,smallSphere);
      signals.push({curve:a.curve,dot:dotA,reverse:false,phase:signals.length*.11},{curve:b.curve,dot:dotB,reverse:true,phase:signals.length*.11+.35});
      nerves.push(a.mesh,b.mesh);return a;
    }
    // Pelvis, abdominal muscles, pectorals, back and an opened rib cage.
    ell(pelvis,V(0,.01,-.005),V(.17,.13,.105),skinMat);
    for(const s of [-1,1]){
      ell(pelvis,V(s*.098,.005,-.065),V(.09,.11,.067),tissue);
      const ilium=ell(pelvis,V(s*.115,.035,0),V(.075,.09,.035),tendon);ilium.rotation.z=s*.45;
      muscle(torso,V(s*.015,.37,.087),V(s*.19,.34,.065),.06,.65,0);
      muscle(torso,V(s*.14,.27,.055),V(s*.085,-.04,.075),.043,.45,0);
      muscle(torso,V(s*.06,.41,-.065),V(s*.10,.04,-.075),.055,.5,0);
      muscle(torso,V(s*.035,.52,-.04),V(s*.20,.40,-.025),.035,.65,0);
      muscle(torso,V(s*.031,.59,.005),V(s*.065,.41,.05),.016,.7,0);
      between(torso,V(s*.015,.44,.06),V(s*.21,.415,.015),.006,tendon);
      for(let j=0;j<4;j++)ell(torso,V(s*.034,.22-j*.055,.088),V(.027,.028,.024),tissue);
      ell(torso,V(s*.105,.302,.015),V(.077,.125,.063),organMat);
      for(let j=0;j<7;j++){
        const yy=.42-j*.033,rr=.115+Math.sin(j/7*Math.PI)*.07;
        tube(torso,[V(s*.012,yy,-.065),V(s*rr,yy-.016,-.008),V(s*rr*.8,yy-.033,.079),V(s*.016,yy-.035,.095)],.003,tendon,16);
      }
    }
    const heart=ell(torso,V(.033,.25,.073),V(.038,.06,.035),tissue);heart.rotation.z=.3;
    between(torso,V(0,.35,.01),V(0,.5,.01),.012,tendon);
    // Vertebrae and paired spinal roots.
    for(let j=0;j<25;j++){
      const yy=.63-j*.027;
      const vertebra=ell(torso,V(0,yy,-.047),V(.022,.011,.014),tendon,smallSphere);
      if(j>3&&j<23)for(const s of [-1,1])tube(torso,[V(0,yy,-.035),V(s*.033,yy-.01,-.015),V(s*.065,yy-.022,.005)],.0017,structure,8);
    }
    nervePath(torso,[V(0,.65,-.021),V(0,.42,-.027),V(0,.16,-.025),V(0,-.06,-.024)]);
    for(const s of [-1,1]){
      nervePath(torso,[V(0,.51,-.02),V(s*.11,.46,.015),V(s*.222,.43,.043)]);
      nervePath(torso,[V(0,-.04,-.024),V(s*.045,-.12,.025),V(s*.105,-.145,.062)]);
    }
    // Articulated shoulders, elbows, wrists, hips, knees, and ankles.
    const arms=[],legs=[];
    for(const s of [-1,1]){
      const shoulder=new THREE.Group();shoulder.position.set(s*.222,.415,0);torso.add(shoulder);
      ell(shoulder,V(0,-.025,0),V(.067,.075,.064),tissue);
      between(shoulder,V(0,0,0),V(0,-.29,0),.013,tendon);
      const biceps=muscle(shoulder,V(0,-.035,.029),V(0,-.265,.022),.042,.77,s);
      const triceps=muscle(shoulder,V(0,-.035,-.027),V(0,-.27,-.022),.038,.8,-s);
      if(s===-1){anatomy.biceps={object:biceps,point:V()};anatomy.triceps={object:triceps,point:V()};anatomy.armNerve={object:shoulder,point:V(.008,-.13,.038)}}
      const elbow=new THREE.Group();elbow.position.y=-.29;shoulder.add(elbow);ell(elbow,V(),V(.029,.024,.029),tendon);
      between(elbow,V(),V(0,-.255,0),.009,tendon);between(elbow,V(.014,-.02,0),V(.01,-.25,0),.006,tendon);
      muscle(elbow,V(.009,-.025,.015),V(.004,-.22,.015),.029,.75,s);
      muscle(elbow,V(-.01,-.025,-.012),V(-.005,-.22,-.013),.026,.75,-s);
      const hand=new THREE.Group();hand.position.y=-.26;elbow.add(hand);ell(hand,V(0,-.025,.005),V(.027,.041,.012),skinMat);
      for(let f=0;f<4;f++)between(hand,V((f-1.5)*.012,-.045,0),V((f-1.5)*.013,-.10+Math.abs(f-1.5)*.008,.006),.004,tendon);
      between(hand,V(-s*.02,-.02,0),V(-s*.045,-.053,.012),.005,tendon);
      nervePath(shoulder,[V(0,.015,.043),V(.008,-.13,.038),V(0,-.29,.025)]);
      nervePath(elbow,[V(0,0,.026),V(0,-.13,.028),V(0,-.25,.018)]);
      for(let branch=0;branch<3;branch++)tube(shoulder,[V(0,-.08,.035),V(s*.023,-.13-branch*.035,.025)],.0014,structure,8);
      arms.push({shoulder,elbow,hand,side:s});
      const hip=new THREE.Group();hip.position.set(s*.09,-.035,0);pelvis.add(hip);
      between(hip,V(),V(0,-.42,0),.018,tendon);
      const quadriceps=muscle(hip,V(0,-.045,.038),V(0,-.38,.027),.063,.78,s);
      muscle(hip,V(s*.04,-.045,.013),V(s*.013,-.38,.02),.048,.8,s);
      muscle(hip,V(-s*.035,-.09,.013),V(-s*.013,-.36,.03),.042,.8,s);
      const hamstrings=muscle(hip,V(0,-.05,-.039),V(0,-.38,-.023),.052,.74,-s);
      const knee=new THREE.Group();knee.position.y=-.42;hip.add(knee);
      ell(knee,V(0,0,.026),V(.031,.036,.019),tendon);
      between(knee,V(),V(0,-.41,.005),.012,tendon);between(knee,V(s*.022,-.03,-.006),V(s*.022,-.39,-.006),.006,tendon);
      const calf=muscle(knee,V(0,-.025,-.028),V(0,-.30,-.012),.047,.88,-s);
      muscle(knee,V(s*.022,-.04,.016),V(s*.015,-.34,.011),.029,.72,s);
      const achilles=between(knee,V(0,-.26,-.02),V(0,-.40,-.015),.009,tendon);
      if(s===-1){anatomy.quad={object:quadriceps,point:V()};anatomy.hamstring={object:hamstrings,point:V()};anatomy.calf={object:calf,point:V()};anatomy.achilles={object:achilles,point:V()};anatomy.legNerve={object:hip,point:V(.015,-.18,.065)};anatomy.sensory={object:hip,point:V(.024,-.24,.068)}}
      const foot=new THREE.Group();foot.position.y=-.415;knee.add(foot);ell(foot,V(0,0,.045),V(.038,.024,.075),skinMat);
      between(foot,V(0,0,-.015),V(0,-.009,.095),.016,tendon);
      for(let j=0;j<5;j++)ell(foot,V((j-2)*.013,-.008,.10+(.015-Math.abs(j-2)*.006)),V(.007,.008,.017),tendon,smallSphere);
      nervePath(hip,[V(s*.015,.01,.062),V(s*.015,-.18,.065),V(s*.012,-.42,.048)]);
      nervePath(knee,[V(s*.012,0,.049),V(s*.018,-.20,.043),V(s*.013,-.39,.024)]);
      for(let j=0;j<3;j++)tube(hip,[V(.01,-.10-j*.06,.06),V(-s*.03,-.14-j*.06,.035)],.0015,structure,8);
      legs.push({hip,knee,foot,side:s});
    }
    // Neck, face, and two folded cerebral hemispheres.
    const neck=ell(torso,V(0,.52,0),V(.045,.075,.043),skinMat);
    const head=new THREE.Group();head.position.set(0,.66,.006);torso.add(head);
    ell(head,V(0,-.035,.014),V(.091,.115,.091),skinMat);
    ell(head,V(0,-.035,.103),V(.012,.024,.017),tendon);
    for(const s of [-1,1]){
      ell(head,V(s*.096,-.025,.006),V(.014,.029,.012),skinMat);
      ell(head,V(s*.034,-.014,.084),V(.014,.009,.01),tendon);
      const geo=new THREE.SphereGeometry(1,56,42),pos=geo.attributes.position;
      for(let k=0;k<pos.count;k++){
        const x=pos.getX(k),y=pos.getY(k),z=pos.getZ(k);
        const fold=1+.035*Math.sin(y*23+Math.sin(z*12)*1.5)+.022*Math.sin(z*29+x*10);
        pos.setXYZ(k,x*fold,y*fold,z*fold);
      }geo.computeVertexNormals();
      const hemiMaterial=brainMat.clone();(materials.brain??=[]).push(hemiMaterial);
      const hemi=ell(head,V(s*.043,.026,.005),V(.048,.079,.098),hemiMaterial,geo);hemispheres.push(hemi);
      for(let j=0;j<11;j++){
        const yy=-.84+j*.157,pts=[];
        for(let k=0;k<=22;k++){
          const theta=-Math.PI*.42+k/22*Math.PI*.84,y=yy+.085*Math.sin(theta*5+j*.8)+.025*Math.sin(theta*14+j),r=Math.sqrt(Math.max(.01,1-y*y));
          const z=Math.sin(theta)*r,x=s*(.043+.048*Math.cos(theta)*r);
          pts.push(V(x,y*.079+.026,z*.098+.005));
        }tube(head,pts,.0008,grooveMat,24);
      }
      const cerebellum=ell(head,V(s*.029,-.047,-.06),V(.034,.030,.041),brainMat);
      for(let j=0;j<5;j++)tube(head,[V(s*.005,-.063+j*.008,-.08),V(s*.03,-.067+j*.008,-.096),V(s*.055,-.058+j*.008,-.074)],.0009,grooveMat,12);
      const deep=ell(head,V(s*.022,.012,.003),V(.010,.015,.018),neural);brainNodes.push({mesh:deep,kind:'deep'});
    }
    ell(head,V(0,-.068,-.026),V(.016,.04,.017),tendon);
    const planning=ell(head,V(-.051,.036,.084),V(.022,.026,.012),mat('activity',colors['viz-series-1'],{emissive:colors['viz-series-1'],emissiveIntensity:skilled?.1:.65,transparent:true,opacity:skilled?.22:.8}));
    brainNodes.push({mesh:planning,kind:'planning'});
    const motor=ell(head,V(.039,.094,.01),V(.019,.012,.034),neural);brainNodes.push({mesh:motor,kind:'motor'});
    const circuits=[
      [V(-.051,.036,.084),V(-.02,.09,.06),V(.039,.094,.01)],
      [V(.039,.094,.01),V(.04,.05,0),V(.022,.012,.003)],
      [V(.039,.094,.01),V(.04,-.01,-.04),V(.029,-.047,-.06)],
      [V(.029,-.047,-.06),V(-.03,-.01,.005),V(.022,.012,.003)]
    ];
    circuits.forEach((pts,j)=>{const a=tube(head,pts,.0014,neural,24),dot=ell(head,V(),V(.003,.003,.003),neural,smallSphere);signals.push({curve:a.curve,dot,reverse:false,phase:j*.25,brain:true})});
    // A small neutral ground ring anchors the body without a backdrop.
    const floor=new THREE.Mesh(new THREE.CircleGeometry(.58,64),new THREE.MeshBasicMaterial({color:mix('foreground','background',.85),transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=.025;scene.add(floor);
    anatomy.plan={object:planning,point:V()};anatomy.motor={object:motor,point:V()};
    anatomy.basal={object:head,point:V(-.022,.012,.003)};anatomy.cerebellum={object:head,point:V(-.029,-.047,-.06)};
    anatomy.spinal={object:torso,point:V(0,.25,-.025)};
    const view={scene,camera,renderer,container,canvas,rootGroup,pelvis,torso,head,arms,legs,muscles,materials,signals,nerves,hemispheres,heart,skilled,planning,lights:[key,fill],floor,anatomy,index};
    createLabels(view);
    createDemoRoute(view);
    views.push(view);
    return view;
  }
  try {build(false,0);build(true,1)}
  catch(e){q('#dt-detail').textContent='อุปกรณ์นี้ยังเปิดภาพ 3 มิติไม่ได้ ลองเปิดในหน้าต่างที่รองรับ WebGL';q('#dt-detail').setAttribute('role','alert');return}
  function createLabels(v){
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('class','dt-leaders');svg.setAttribute('aria-hidden','true');v.container.append(svg);v.labelSvg=svg;v.labels={};
    for(const [id,p] of Object.entries(parts)){
      const wrap=document.createElement('div'),button=document.createElement('button'),line=document.createElementNS(ns,'line'),dot=document.createElementNS(ns,'circle');
      wrap.className='dt-label';button.type='button';button.className='btn text-small';button.textContent=p.label;button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','dt-info');button.dataset.part=id;
      button.setAttribute('aria-label',`${p.name} · ${v.skilled?'ฝึกจนคล่อง':'เริ่มฝึก'}`);
      button.addEventListener('click',()=>selectPart(id));wrap.append(button);v.container.append(wrap);svg.append(line,dot);dot.setAttribute('r','3');
      v.labels[id]={wrap,button,line,dot};wrap.hidden=true;line.style.display='none';dot.style.display='none';
    }
  }
  function selectPart(id){
    if(!parts[id])return;selected=id;
    if(!demo&&focus==='body'){focus=parts[id].focus;zoom=1;yaw=focus==='brain'?-.5:.18;pitch=focus==='brain'?.2:.06;q('#dt-focus').value=focus}
    update();save();
  }
  function createDemoRoute(v){
    const group=new THREE.Group();v.scene.add(group);
    const material=new THREE.MeshBasicMaterial({color:colors['viz-series-1'],transparent:true,opacity:.7,depthTest:false,depthWrite:false});
    const dotMaterial=new THREE.MeshBasicMaterial({color:colors['viz-series-1'],depthTest:false,depthWrite:false});
    const geometry=new THREE.CylinderGeometry(1,1,1,8),segments=[];
    for(let i=0;i<24;i++){const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=20;group.add(mesh);segments.push(mesh)}
    const dot=new THREE.Mesh(smallSphere,dotMaterial),arrow=new THREE.Mesh(new THREE.ConeGeometry(1,1,10),dotMaterial);dot.renderOrder=21;arrow.renderOrder=22;group.add(dot,arrow);
    v.demoRoute={group,segments,material,dotMaterial,dot,arrow};
  }
  function renderDemoRoute(v){
    const route=v.demoRoute;route.group.visible=demo;if(!demo)return;
    const world=(o,p)=>o.localToWorld(p.clone()),head=p=>world(v.head,p),torso=p=>world(v.torso,p),hip=p=>world(v.legs[0].hip,p),knee=p=>world(v.legs[0].knee,p);
    const motor=head(V(.039,.094,.01)),neck=head(V(0,-.075,-.026)),cord=torso(V(0,.25,-.025)),lumbar=torso(V(0,-.04,-.024)),leg=hip(V(-.015,-.18,.065)),quad=v.anatomy.quad.object.getWorldPosition(V()),sense=knee(V(.012,0,.049)),brainSense=head(V(.035,.078,-.025));
    const routes=[
      [head(V(-.051,.036,.084)),head(V(-.02,.09,.06)),motor],
      [motor,neck,torso(V(0,.52,-.025)),cord,lumbar],
      [lumbar,torso(V(-.045,-.12,.025)),hip(V(-.015,.01,.062)),leg,quad],
      [quad,knee(V(0,0,.028))],
      [sense,hip(V(-.006,-.18,.068)),torso(V(.009,-.04,-.02)),torso(V(.009,.25,-.02)),head(V(.009,-.075,-.024)),brainSense],
      [brainSense,head(V(-.025,.02,-.04)),head(V(-.029,-.047,-.06)),head(V(.02,.035,.01)),motor]
    ];
    const curve=new THREE.CatmullRomCurve3(routes[demoStep],false,'centripetal'),color=demoStep===4?colors['viz-series-2']:colors['viz-series-1'];
    route.material.color.copy(color);route.dotMaterial.color.copy(color);
    const r=focus==='brain'?.0017:.0045;
    for(let i=0;i<route.segments.length;i++){
      const a=curve.getPoint(i/24),b=curve.getPoint((i+1)/24),mesh=route.segments[i],direction=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(r,direction.length(),r);mesh.quaternion.setFromUnitVectors(Y,direction.normalize());
    }
    const progress=Math.max(.001,Math.min(.999,demoProgress)),p=curve.getPoint(progress),dir=curve.getTangent(progress).normalize();
    route.dot.position.copy(p);route.dot.scale.setScalar(r*2.2);route.arrow.position.copy(p).addScaledVector(dir,r*2.5);route.arrow.scale.set(r*2.3,r*6,r*2.3);route.arrow.quaternion.setFromUnitVectors(Y,dir);
    if(demoStep===3){const m=v.anatomy.quad.object.material;m.emissive.copy(colors['viz-series-1']);m.emissiveIntensity=.2+.4*Math.sin(Math.PI*demoProgress);const antagonist=v.anatomy.hamstring.object.material;antagonist.emissiveIntensity=v.skilled?.03:.22}
  }
  function setDemoStep(k){
    playing=false;cancelAnimationFrame(raf);last=0;started=0;demoProgress=0;
    demoStep=Math.max(0,Math.min(steps.length-1,k));focus=steps[demoStep].focus;selected=steps[demoStep].part;zoom=1;yaw=focus==='brain'?-.5:.18;pitch=focus==='brain'?.2:.06;t=demoStep>=4?1.2:.3;
    q('#dt-focus').value=focus;update();
  }
  function positionLabels(v,w,h){
    v.labelSvg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const rows={left:[],right:[]};
    for(const [id,l] of Object.entries(v.labels)){
      const visible=labelSets[focus].includes(id);l.wrap.hidden=!visible;l.line.style.display=visible?'':'none';l.dot.style.display=visible?'':'none';if(!visible)continue;
      const active=selected===id;l.button.setAttribute('aria-pressed',String(active));l.line.classList.toggle('dt-selected',active);l.dot.classList.toggle('dt-selected',active);
      const a=v.anatomy[id],p=a.object.localToWorld(a.point.clone()).project(v.camera);
      const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
      // Keep a label available at high zoom, with its endpoint at the visible edge.
      const xx=Math.max(5,Math.min(w-5,x)),yy=Math.max(5,Math.min(h-5,y));
      const side=focus==='body'?({plan:'left',spinal:'right',biceps:'left',quad:'left',calf:'right'}[id]):parts[id].side;const rect=l.wrap.getBoundingClientRect();
      rows[side].push({id,...l,x:xx,y:yy,height:rect.height||30,width:rect.width||100,desired:Math.max(4,Math.min(h-(rect.height||30)-4,yy-(rect.height||30)/2))});
    }
    for(const side of ['left','right']){
      const list=rows[side].sort((a,b)=>a.desired-b.desired);let next=4;
      for(const row of list){row.top=Math.max(next,row.desired);next=row.top+row.height+8}
      if(list.length&&next>h+4){let bottom=h-4;for(let j=list.length-1;j>=0;j--){const row=list[j];row.top=Math.min(row.top,bottom-row.height);bottom=row.top-8}}
      for(const row of list){const left=side==='left'?2:w-row.width-2;row.wrap.style.left=`${left}px`;row.wrap.style.top=`${Math.max(2,row.top)}px`;
        row.line.setAttribute('x1',side==='left'?left+row.width:left);row.line.setAttribute('y1',Math.max(2,row.top)+row.height/2);row.line.setAttribute('x2',row.x);row.line.setAttribute('y2',row.y);row.dot.setAttribute('cx',row.x);row.dot.setAttribute('cy',row.y);
      }
    }
  }
  function appearance(v){
    for(const [kind,list] of Object.entries(v.materials)){
      for(const m of list){
        let opacity=1;
        if(kind==='muscle')opacity=focus==='nerves'?.08:focus==='brain'?.055:1;
        if(kind==='bone')opacity=focus==='brain'?.06:focus==='nerves'?.28:.72;
        if(kind==='skin')opacity=focus==='brain'?.015:focus==='nerves'?.025:.10;
        if(kind==='organ')opacity=focus==='body'?.25:.025;
        if(kind==='brain')opacity=focus==='brain'?.27:1;
        if(kind==='groove')opacity=focus==='brain'?.55:1;
        if(kind==='nervebase'&&focus==='brain')opacity=0;
        if(kind==='activity')opacity=v.skilled?.22:.8;
        if(demo&&['nerve','sensory','nervebase'].includes(kind))opacity=.19;
        m.transparent=opacity<1;m.opacity=opacity;m.depthWrite=opacity>.6;m.needsUpdate=true;
      }
    }
    v.floor.visible=focus==='body'||focus==='nerves';
    v.nerves.forEach(n=>n.visible=focus!=='brain');
  }
  function pose(v){
    const p=t*2.5;
    // A common target sequence; novice pauses model interrupted coordination, not nerve speed.
    const ease=p-Math.floor(p/.9)*.9;
    const a=v.skilled?p:Math.floor(p/.9)*.9+Math.min(ease/.45,1)*.9;
    const s=Math.sin(a),c=Math.cos(a),bounce=v.skilled?.018:.012;
    v.rootGroup.position.set(s*.035,.95+Math.cos(a*2)*bounce,0);
    v.pelvis.rotation.y=s*.12;v.torso.rotation.z=s*.045;v.torso.rotation.y=-s*.1;
    v.arms.forEach(o=>{o.shoulder.rotation.z=o.side*(.2+.35*(1+Math.sin(a+o.side*.4)));o.shoulder.rotation.x=Math.sin(a+o.side)*.33;o.elbow.rotation.x=-.2-.55*(1+Math.cos(a+o.side));o.hand.rotation.z=Math.sin(a)*.1});
    v.legs.forEach(o=>{const step=Math.sin(a+o.side*Math.PI/2);o.hip.rotation.x=step*.25;o.hip.rotation.z=o.side*(.06+.09*Math.max(0,step));o.knee.rotation.x=Math.max(0,step)*.44+.045;o.foot.rotation.x=-Math.max(0,step)*.14});
    v.muscles.forEach(m=>{const act=v.skilled?Math.max(0,Math.sin(a+m.phase*1.6)):.35+.48*Math.max(0,Math.sin(a+m.phase));const factor=1+act*.045;m.mesh.scale.x=m.base*factor;m.mesh.scale.z=m.base*m.depth*factor;m.material.emissive.copy(colors.red);m.material.emissiveIntensity=(focus==='muscle'||focus==='arms'?.18:.055)*act});
    v.heart.scale.set(.038*(1+.05*Math.max(0,Math.sin(t*7))),.06,.035);
    v.signals.forEach(s=>{let u=(t*.65+s.phase)%1;if(s.reverse)u=1-u;s.dot.position.copy(s.curve.getPoint(u));s.dot.visible=!demo&&!['muscle','arms'].includes(focus)&&(focus!=='brain'||!!s.brain)});
    v.scene.updateMatrixWorld(true);
  }
  function render(){
    for(const v of views){
      pose(v);
      renderDemoRoute(v);
      const h=v.container.clientHeight,w=v.container.clientWidth;
      if(!w||!h)continue;
      if(v.renderer.domElement.width!==Math.round(w*v.renderer.getPixelRatio())||v.renderer.domElement.height!==Math.round(h*v.renderer.getPixelRatio()))v.renderer.setSize(w,h,false);
      v.camera.aspect=w/h;v.camera.updateProjectionMatrix();
      let target=V(0,1,0);
      if(focus==='brain')v.head.getWorldPosition(target).add(V(0,.025,0));
      if(focus==='nerves')target=V(0,1.03,0);
      if(focus==='muscle'){v.legs[0].hip.getWorldPosition(target);target.add(V(.03,-.40,0))}
      if(focus==='arms'){v.arms[0].shoulder.getWorldPosition(target);target.add(V(0,-.15,0))}
      const d=modes[focus].distance/zoom;
      v.camera.position.copy(target).add(V(Math.sin(yaw)*Math.cos(pitch)*d,Math.sin(pitch)*d,Math.cos(yaw)*Math.cos(pitch)*d));
      v.camera.lookAt(target);v.camera.updateMatrixWorld();v.renderer.render(v.scene,v.camera);positionLabels(v,w,h);
    }
    root.dataset.simulationTime=t.toFixed(4);
    root.dataset.demoStep=demo?String(demoStep):'off';root.dataset.demoProgress=demoProgress.toFixed(3);
  }
  function update(){
    q('#dt-detail').textContent=demo?steps[demoStep].detail:modes[focus].detail;
    q('#dt-mode').value=demo?'demo':'explore';q('#dt-demo-nav').hidden=!demo;q('#dt-demo-note').hidden=!demo;q('#dt-step').hidden=demo;q('#dt-focus').disabled=demo;q('#dt-focus').value=focus;
    q('#dt-demo-status').textContent=`${demoStep+1}/6 · ${steps[demoStep].title}`;q('#dt-prev').disabled=demoStep===0;q('#dt-next').disabled=demoStep===5;
    q('#dt-parts').hidden=true;
    const part=parts[selected];q('#dt-info').hidden=!part;
    if(part){q('#dt-info-title').textContent=part.name;q('#dt-info-role').textContent=part.role}
    q('#dt-text-0').textContent=demo?steps[demoStep].early:part?part.early:modes[focus].captions[0];q('#dt-text-1').textContent=demo?steps[demoStep].late:part?part.late:modes[focus].captions[1];
    q('#dt-play').textContent=playing?'หยุดชั่วคราว':demo?(reduce.matches?'ขยับสัญญาณทีละช่วง':demoProgress>=1?'เล่นขั้นนี้ซ้ำ':'เล่นขั้นนี้'):'เล่นการเต้น';q('#dt-zoom-val').textContent=zoom.toFixed(1)+'×';q('#dt-zoom').value=zoom;
    views.forEach(appearance);render();
  }
  function save(){try{localStorage.setItem('education-dance-state-v1',JSON.stringify({privateContent:{focus,zoom,yaw,pitch,speed,selected,demo,demoStep}}))}catch{}}
  function stop(){playing=false;last=0;cancelAnimationFrame(raf);update()}
  function tick(ts){if(!playing)return;if(!started)started=ts;const delta=last?Math.min((ts-last)/1000,.1)*speed:0;last=ts;if(demo){demoProgress=Math.min(1,demoProgress+delta/2.4);t=demoStep===3?.3+demoProgress*.9:demoStep>=4?1.2:.3}else t+=delta;render();if((demo&&demoProgress>=1)||ts-started>30000){stop();return}raf=requestAnimationFrame(tick)}
  q('#dt-play').addEventListener('click',()=>{if(playing){stop();return}if(demo&&demoProgress>=1)demoProgress=0;if(reduce.matches){if(demo){demoProgress=Math.min(1,demoProgress+.2);t=demoStep===3?.3+demoProgress*.9:demoStep>=4?1.2:.3}else t+=.25;update();return}playing=true;last=0;started=0;update();raf=requestAnimationFrame(tick)});
  q('#dt-mode').addEventListener('change',e=>{const next=e.target.value==='demo';stop();demo=next;if(demo)setDemoStep(0);else update();save()});
  q('#dt-prev').addEventListener('click',()=>{setDemoStep(demoStep-1);save()});q('#dt-next').addEventListener('click',()=>{setDemoStep(demoStep+1);save()});
  q('#dt-step').addEventListener('click',()=>{stop();t+=.12;render()});
  q('#dt-speed').addEventListener('change',e=>{speed=+e.target.value;last=0;save()});
  q('#dt-focus').addEventListener('change',e=>{focus=e.target.value;selected=null;zoom=1;pitch=focus==='brain'?.2:.06;yaw=focus==='brain'?-.5:.18;update();save()});
  q('#dt-zoom').addEventListener('input',e=>{zoom=+e.target.value;update()});q('#dt-zoom').addEventListener('change',save);
  q('#dt-left').addEventListener('click',()=>{yaw-=.3;render();save()});q('#dt-right').addEventListener('click',()=>{yaw+=.3;render();save()});
  for(const v of views){
    let drag=null;const pointers=new Map();let pinch=0;
    v.canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});v.canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY};if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}});
    v.canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch>0)zoom=Math.max(.7,Math.min(2.8,zoom*d/pinch));pinch=d;update();return}if(drag){yaw-=(e.clientX-drag.x)*.008;pitch=Math.max(-.7,Math.min(.7,pitch+(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY};render()}});
    const end=e=>{pointers.delete(e.pointerId);drag=null;pinch=0;save()};v.canvas.addEventListener('pointerup',end);v.canvas.addEventListener('pointercancel',end);
    v.canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.7,Math.min(2.8,zoom*Math.exp(-e.deltaY*.001)));update();save()},{passive:false});
    new ResizeObserver(render).observe(v.container);
  }
  function restore(state){const s=state?.privateContent;if(!s||!modes[s.focus])return;const nd=typeof s.demo==='boolean'?s.demo:true,nk=Number.isInteger(s.demoStep)?Math.max(0,Math.min(5,s.demoStep)):0,nf=nd?steps[nk].focus:s.focus,ns=[.25,.5,1].includes(s.speed)?s.speed:.25,np=parts[s.selected]?s.selected:nd?steps[nk].part:null;if(nf===focus&&s.zoom===zoom&&s.yaw===yaw&&s.pitch===pitch&&ns===speed&&np===selected&&nd===demo&&nk===demoStep)return;if(nd!==demo||nk!==demoStep){playing=false;cancelAnimationFrame(raf);last=0;demoProgress=0;t=nk>=4?1.2:.3}demo=nd;demoStep=nk;focus=nf;zoom=Number.isFinite(s.zoom)?Math.max(.7,Math.min(2.8,s.zoom)):1;yaw=Number.isFinite(s.yaw)?s.yaw:.18;pitch=Number.isFinite(s.pitch)?Math.max(-.7,Math.min(.7,s.pitch)):.06;speed=ns;selected=np;q('#dt-focus').value=focus;q('#dt-speed').value=String(speed);update()}
  try{restore(JSON.parse(localStorage.getItem('education-dance-state-v1')))}catch{}
  q('#dt-play').disabled=false;q('#dt-step').disabled=false;ready=true;update();root.dataset.ready='true';
  function theme(){
    getColors();
    const shades={muscle:mix('red','background',.2),bone:mix('foreground','background',.52),brain:mix('red','background',.5),groove:mix('red','foreground',.4),skin:mix('foreground','background',.82),organ:mix('red','background',.55),nerve:colors['viz-series-1'],sensory:colors['viz-series-2'],nervebase:mix('yellow','background',.25),activity:colors['viz-series-1']};
    for(const v of views){for(const [kind,list] of Object.entries(v.materials))for(const m of list){if(shades[kind])m.color.copy(shades[kind]);if(kind==='nerve'||kind==='activity')m.emissive.copy(colors['viz-series-1']);if(kind==='sensory')m.emissive.copy(colors['viz-series-2'])}v.floor.material.color.copy(mix('foreground','background',.85))}render();
  }
  new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop()});reduce.addEventListener('change',()=>{if(reduce.matches)stop()});
})();
