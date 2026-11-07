
(() => {
  const root=document.getElementById('nervous-daily');
  const q=s=>root.querySelector(s);
  const map=q('#nd-map'), svg=q('#nd-wires'), lines=q('#nd-lines'), packets=q('#nd-packets');
  const ns='http://www.w3.org/2000/svg';
  const nodes=Object.fromEntries([...root.querySelectorAll('[data-node]')].map(n=>[n.dataset.node,n]));
  const edges=[
    ['sense','focus','normal'],['focus','memory','across'],['memory','focus','back'],
    ['focus','habit','normal'],['habit','motor','normal'],['focus','motor','left'],
    ['sense','cerebellum','right'],['cerebellum','motor','normal'],
    ['focus','autonomic','right'],['motor','spine','normal'],
    ['autonomic','organs','normal'],['spine','muscles','normal'],
    ['muscles','sense','feedback']
  ];
  const stages=['รับข้อมูล','ตีความ','เตรียมตอบสนอง','ลงมือทำ','รับผลและปรับ'];
  const scenes={
    walk:{
      text:[
        'มองทางและรับความรู้สึกจากเท้า แม้เป็นเส้นทางเดิมก็ยังต้องรับข้อมูลใหม่',
        'ความจำช่วยรู้ว่ากำลังอยู่ตรงไหน และความสนใจช่วยสังเกตทางข้างหน้า',
        'วงจรเลือกการกระทำและสมองน้อยช่วยให้ก้าวเดินต่อเนื่องและทรงตัว',
        'คำสั่งผ่านไขสันหลังและเส้นประสาทไปยังกล้ามเนื้อขา ให้ก้าวไปข้างหน้า',
        'ข้อมูลจากตาและร่างกายย้อนกลับมาช่วยปรับก้าว หากพื้นเปลี่ยนก็ต้องปรับทันที'
      ],
      n:[['sense'],['focus','memory'],['habit','cerebellum','motor'],['motor','spine','muscles'],['muscles','sense','cerebellum','motor']],
      e:[[0],[1,2],[3,4,6,7],[9,11],[12,6,7]]
    },
    dance:{
      text:[
        'ดูท่าผู้สอน ฟังจังหวะ และรับรู้ตำแหน่งแขนขาของตัวเอง',
        'ใส่ใจลำดับใหม่และเทียบกับท่าที่เคยรู้ จึงอาจต้องคิดทีละขั้น',
        'วางแผนการเคลื่อนไหว โดยวงจรเลือกการกระทำและสมองน้อยร่วมช่วย',
        'ส่งคำสั่งไปยังแขนขา การเคลื่อนไหวช่วงแรกอาจยังไม่ตรงจังหวะ',
        'เปรียบเทียบผลกับเป้าหมายและปรับท่ารอบต่อไป การฝึกช่วยเปลี่ยนการทำงานของวงจร'
      ],
      n:[['sense'],['focus','memory'],['focus','habit','cerebellum','motor'],['motor','spine','muscles'],['muscles','sense','focus','cerebellum','motor']],
      e:[[0],[1,2],[3,4,5,6,7],[9,11],[12,0,6,7]]
    },
    puzzle:{
      text:[
        'อ่านโจทย์ใหม่ เช่น 17 × 6 แล้วเลือกข้อมูลที่ต้องใช้',
        'ดึงวิธีคูณที่เคยเรียนมา และคงข้อมูลไว้ในใจระหว่างคิด',
        'วางแผนแยกเป็น 10 × 6 กับ 7 × 6 แล้วนำผลมารวมกัน',
        'ได้คำตอบในใจ 102; ถ้าจะเขียนคำตอบ จึงใช้วงจรสั่งการมือเพิ่มเติม',
        'ตรวจคำตอบกับโจทย์ หากผิดก็กลับไปทบทวนวิธีคิดและความรู้เดิม'
      ],
      n:[['sense'],['focus','memory'],['focus','memory'],['focus','memory'],['sense','focus','memory']],
      e:[[0],[1,2],[1,2],[1,2],[0,1,2]]
    },
    talk:{
      text:[
        'เห็นผู้ฟังและได้ยินเสียงในห้อง รับข้อมูลทั้งจากภายนอกและร่างกาย',
        'ประเมินสถานการณ์และดึงเนื้อหาที่เตรียมไว้ ประสบการณ์เดิมมีผลต่อการตีความ',
        'เครือข่ายสมองร่วมกับระบบอัตโนมัติปรับความตื่นตัว อาจมีหัวใจเต้นเร็วหรือเหงื่อออก',
        'เครือข่ายภาษาและการเคลื่อนไหวช่วยให้พูด; ในภาพเน้นคำสั่งแขนขาขณะใช้ท่าทาง',
        'ฟังเสียงตนเองและสังเกตผู้ฟัง แล้วปรับจังหวะ เนื้อหา และท่าทาง'
      ],
      n:[['sense'],['focus','memory'],['focus','autonomic','organs'],['motor','spine','muscles','autonomic','organs'],['sense','focus','memory','motor']],
      e:[[0],[1,2],[8,10],[9,11,10],[12,0,1,5]]
    }
  };
  let scene='walk', stage=0, playing=false, timer=null, raf=null, paths=[];
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function element(tag,attrs){const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el}
  function draw(){
    const base=map.getBoundingClientRect(), w=base.width,h=base.height;
    if(!w||!h)return;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const box=id=>{const r=nodes[id].getBoundingClientRect();return {x:r.left-base.left,y:r.top-base.top,w:r.width,h:r.height,cx:r.left-base.left+r.width/2,cy:r.top-base.top+r.height/2}};
    lines.replaceChildren();paths=[];
    edges.forEach(([a,b,kind],i)=>{
      const s=box(a),t=box(b);let d;
      if(kind==='across'||kind==='back'){
        const yy=s.y+s.h*(kind==='across'?.35:.7);
        d=kind==='across'?`M ${s.x+s.w} ${yy} L ${t.x} ${yy}`:`M ${s.x} ${yy} L ${t.x+t.w} ${yy}`;
      } else if(kind==='left'||kind==='right'||kind==='feedback'){
        const lane=kind==='right'?w-5:kind==='feedback'?3:11;
        d=kind==='feedback'?`M ${s.x} ${s.cy} H ${lane} V ${t.cy} H ${t.x}`:
          `M ${s.cx} ${s.y+s.h} V ${s.y+s.h+10} H ${lane} V ${t.y-10} H ${t.cx} V ${t.y}`;
      }else{
        const sy=s.y+s.h,ty=t.y,mid=(sy+ty)/2;
        d=`M ${s.cx} ${sy} C ${s.cx} ${mid}, ${t.cx} ${mid}, ${t.cx} ${ty}`;
      }
      const p=element('path',{d,class:'nd-wire','data-edge':i});lines.append(p);paths.push(p);
    });
    mark();
  }
  function mark(){
    const s=scenes[scene];
    for(const [id,n] of Object.entries(nodes))n.classList.toggle('nd-on',s.n[stage].includes(id));
    paths.forEach((p,i)=>p.classList.toggle('nd-on',s.e[stage].includes(i)));
    packets.replaceChildren();
    if(playing&&!reduced.matches)s.e[stage].forEach(i=>packets.append(element('circle',{r:3.5,class:'nd-packet','data-edge':i})));
  }
  function update(){q('#nd-phase').textContent=`${stage+1}/5 · ${stages[stage]}`;q('#nd-detail').textContent=scenes[scene].text[stage];q('#nd-play').textContent=playing?'หยุดชั่วคราว':'เล่นการทำงาน';mark()}
  function save(){try{localStorage.setItem('education-nervous-state-v1',JSON.stringify({privateContent:{scene,stage}}))}catch{}}
  function stop(){playing=false;clearTimeout(timer);cancelAnimationFrame(raf);update()}
  function motion(t){if(!playing)return;for(const dot of packets.children){const p=paths[+dot.dataset.edge];if(!p)continue;const pos=p.getPointAtLength(((t%1600)/1600)*p.getTotalLength());dot.setAttribute('cx',pos.x);dot.setAttribute('cy',pos.y)}raf=requestAnimationFrame(motion)}
  function schedule(){timer=setTimeout(()=>{if(stage===4){stop();save();return}stage++;update();schedule()},2800)}
  q('#nd-play').addEventListener('click',()=>{if(playing){stop();save();return}if(stage===4)stage=0;playing=true;update();if(!reduced.matches)raf=requestAnimationFrame(motion);schedule();save()});
  q('#nd-next').addEventListener('click',()=>{stop();stage=(stage+1)%5;update();save()});
  q('#nd-scene').addEventListener('change',e=>{stop();scene=e.target.value;stage=0;update();save()});
  function restore(state){const s=state?.privateContent;if(!s||!scenes[s.scene])return;const next=Number.isInteger(s.stage)?Math.max(0,Math.min(4,s.stage)):0;if(scene===s.scene&&stage===next)return;stop();scene=s.scene;stage=next;q('#nd-scene').value=scene;update()}
  try{restore(JSON.parse(localStorage.getItem('education-nervous-state-v1')))}catch{}
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop()});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);mark();if(playing&&!reduced.matches)raf=requestAnimationFrame(motion)});
  new ResizeObserver(draw).observe(map);
  update();draw();
})();
