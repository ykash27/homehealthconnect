const { useState, useMemo, useCallback, createContext, useContext, useRef } = React;

// ─── THEME ────────────────────────────────────────────────────
const ThemeCtx = createContext({ dark: true, setDark: () => {} });
const useTheme = () => useContext(ThemeCtx);
const DARK_T = {
  bg:"#04080F",surface:"#0B1120",surfaceUp:"#111827",border:"#1F2D45",
  blue:"#2D7EF8",blueDim:"#2D7EF818",purple:"#7C5AF8",purpleDim:"#7C5AF818",
  teal:"#0DC8A4",tealDim:"#0DC8A418",amber:"#F59E0B",amberDim:"#F59E0B18",
  red:"#F43F5E",redDim:"#F43F5E18",green:"#10B981",greenDim:"#10B98118",
  text:"#F0F6FF",textMid:"#94A3B8",textDim:"#3D5166",
  font:"'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif",
};
const LIGHT_T = {
  bg:"#E8EDF5",surface:"#FFFFFF",surfaceUp:"#F4F7FB",border:"#B8C8DC",
  blue:"#1D4ED8",blueDim:"#1D4ED820",purple:"#6D28D9",purpleDim:"#6D28D920",
  teal:"#0F766E",tealDim:"#0F766E20",amber:"#92400E",amberDim:"#92400E20",
  red:"#9F1239",redDim:"#9F123920",green:"#14532D",greenDim:"#14532D20",
  text:"#0D1117",textMid:"#1E293B",textDim:"#64748B",
  font:"'SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif",
};
const T = DARK_T; // static fallback

// ─── AGENCY COLORS ────────────────────────────────────────────
const AC = {
  ag1:{primary:"#2D7EF8",light:"#2D7EF820",name:"SunCare",logo:"☀️"},
  ag2:{primary:"#0DC8A4",light:"#0DC8A420",name:"Pacific",logo:"🌊"},
  ag3:{primary:"#7C5AF8",light:"#7C5AF820",name:"Heartland",logo:"💙"},
};

// ─── VISIT TYPES ──────────────────────────────────────────────
const VT = [
  {id:"soc",     code:"SOC",        label:"SOC / RECERT / RESUMPTION OASIS",color:"#7C5AF8"},
  {id:"eval",    code:"EVAL",       label:"Evaluation",                      color:"#2D7EF8"},
  {id:"followup",code:"FOLLOWUP",   label:"Follow-Up / Reassessment / DC",   color:"#0DC8A4"},
  {id:"cosign",  code:"COSIGN",     label:"Co-Sign",                         color:"#F59E0B"},
  {id:"nonvisit",code:"NON-VISIT",  label:"Non-Visit D/C",                   color:"#94A3B8"},
  {id:"otdc",    code:"OT DC OASIS",label:"OT DC OASIS",                     color:"#F43F5E"},
];
const RISK_C={high:T.red,medium:T.amber,low:T.green};
const RISK_BG={high:T.redDim,medium:T.amberDim,low:T.greenDim};
const ST_C={approved:T.green,pending:T.amber,paid:T.blue,open:T.teal,invoiced:T.purple,scheduled:T.blue};
const fmt$=n=>`$${Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const openNav=addr=>window.open(`https://maps.apple.com/?q=${encodeURIComponent(addr)}`,"_blank");
const callPhone=p=>window.open(`tel:${p.replace(/\D/g,"")}`);

// ─── DATE HELPERS ─────────────────────────────────────────────
const TODAY = new Date("2026-05-19");
const dAgo=n=>{const d=new Date(TODAY);d.setDate(d.getDate()-n);return d.toISOString().split("T")[0];};
const dFwd=n=>{const d=new Date(TODAY);d.setDate(d.getDate()+n);return d.toISOString().split("T")[0];};
const DAYS_SHORT=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const HOURS=Array.from({length:12},(_,i)=>`${8+i}:00 ${8+i<12?"AM":"PM"}`.replace("12:00 PM","12:00 PM").replace(/^(\d):/, "0$1:"));

// ─── EXERCISES ────────────────────────────────────────────────
const REGIONS=[
  {id:"all",label:"All",emoji:"🧍"},{id:"shoulder",label:"Shoulder",emoji:"💪"},
  {id:"elbow",label:"Elbow",emoji:"🦾"},{id:"wrist",label:"Wrist & Hand",emoji:"✋"},
  {id:"neck",label:"Neck",emoji:"🧠"},{id:"trunk",label:"Trunk & Core",emoji:"🫁"},
  {id:"hip",label:"Hip",emoji:"🦵"},{id:"knee",label:"Knee",emoji:"🦿"},
  {id:"ankle",label:"Ankle & Foot",emoji:"🦶"},{id:"balance",label:"Balance/Gait",emoji:"⚖️"},
  {id:"cognitive",label:"Cognitive/ADL",emoji:"🧩"},{id:"breathing",label:"Breathing",emoji:"🌬️"},
];
const RC={shoulder:"#2D7EF8",elbow:"#3B82F6",wrist:"#06B6D4",neck:"#8B5CF6",trunk:"#7C5AF8",hip:"#EC4899",knee:"#F43F5E",ankle:"#F59E0B",balance:"#10B981",cognitive:"#14B8A6",breathing:"#0DC8A4"};

// ─── EXERCISE CARD ────────────────────────────────────────────

const ExerciseCard=({ex,onAdd,added,onRemove,compact=false})=>{
  const T=useT();
  const[showDetail,setShowDetail]=useState(false);
  const col=RC[ex.r]||T.teal;
  const DC={Easy:T.green,Medium:T.amber,Hard:T.red};
  const regionLabel=REGIONS.find(r=>r.id===ex.r)?.label||ex.r;
  const emoji=REGIONS.find(r=>r.id===ex.r)?.emoji||"💪";

  // ── Compact mode (catalog browser) ─────────────────────────
  if(compact) return(
    <Card style={{padding:"10px 13px",borderLeft:`3px solid ${col}`,marginBottom:7}}>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        {/* Small diagram thumbnail */}
        <div onClick={()=>setShowDetail(v=>!v)}
          style={{width:48,height:48,borderRadius:10,overflow:"hidden",flexShrink:0,cursor:"pointer",
                  background:T.surfaceUp,border:`1px solid ${col}33`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {ex.photo
            ? <img src={ex.photo} alt={ex.name}
                style={{width:"100%",height:"100%",objectFit:"cover"}}
                onError={e=>{e.target.style.display="none";e.target.parentNode.innerHTML=`<span style="font-size:22px">${emoji}</span>`;}}/>
            : <span style={{fontSize:22}}>{emoji}</span>
          }
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:T.text,fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.name}</div>
          <div style={{color:T.textMid,fontSize:10,marginTop:2}}>{ex.sets}×{ex.reps} · {ex.dur} · <span style={{color:DC[ex.diff]}}>{ex.diff}</span></div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          {onAdd&&<button onClick={()=>onAdd(ex.id)} style={{width:30,height:30,borderRadius:9,border:"none",cursor:"pointer",background:added?T.green:T.surfaceUp,display:"flex",alignItems:"center",justifyContent:"center"}}>{added?<Ico n="chk" s={13} c="#fff"/>:<Ico n="plus" s={13} c={T.textDim}/>}</button>}
          {onRemove&&<button onClick={()=>onRemove(ex.id)} style={{background:T.redDim,border:"none",borderRadius:8,padding:"5px 9px",color:T.red,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Remove</button>}
        </div>
      </div>
      {/* Expandable detail panel */}
      {showDetail&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
          {ex.photo&&<img src={ex.photo} alt={ex.name}
            style={{width:"100%",height:140,objectFit:"cover",borderRadius:9,marginBottom:8}}
            onError={e=>{e.target.style.display="none";}}/>}
          <div style={{color:T.textMid,fontSize:11,lineHeight:1.65,marginBottom:6}}>{ex.desc}</div>
          {ex.prec&&<div style={{background:T.amberDim,borderRadius:7,padding:"5px 9px",color:T.amber,fontSize:10}}>⚠️ {ex.prec}</div>}
        </div>
      )}
    </Card>
  );

  // ── Full card (assigned HEP list + patient view) ────────────
  return(
    <Card style={{padding:0,overflow:"hidden",marginBottom:14}}>
      {/* Diagram image */}
      <div style={{position:"relative",height:190,overflow:"hidden",background:T.surfaceUp}}>
        {ex.photo?(
          <img src={ex.photo} alt={`${ex.name} diagram`}
            style={{width:"100%",height:"100%",objectFit:"cover"}}
            onError={e=>{
              e.target.style.display="none";
              e.target.parentNode.style.display="flex";
              e.target.parentNode.style.alignItems="center";
              e.target.parentNode.style.justifyContent="center";
              e.target.parentNode.innerHTML=`<span style="font-size:60px">${emoji}</span>`;
            }}
          />
        ):(
          <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}>
            <span style={{fontSize:56}}>{emoji}</span>
            <span style={{color:T.textDim,fontSize:10}}>{regionLabel}</span>
          </div>
        )}
        {/* Overlay badges */}
        <div style={{position:"absolute",top:10,left:10,display:"flex",gap:5,pointerEvents:"none"}}>
          <span style={{background:`${col}EE`,color:"#fff",fontSize:9,fontWeight:700,borderRadius:20,padding:"3px 9px",backdropFilter:"blur(4px)"}}>{regionLabel}</span>
          <span style={{background:`${DC[ex.diff]}EE`,color:"#fff",fontSize:9,fontWeight:700,borderRadius:20,padding:"3px 9px",backdropFilter:"blur(4px)"}}>{ex.diff}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"14px 15px",borderTop:`3px solid ${col}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{color:T.text,fontWeight:800,fontSize:15,flex:1,lineHeight:1.3}}>{ex.name}</div>
          <div style={{background:T.surfaceUp,borderRadius:9,padding:"6px 10px",textAlign:"center",flexShrink:0,marginLeft:10,border:`1px solid ${T.border}`}}>
            <div style={{color:col,fontWeight:900,fontSize:14}}>{ex.sets}×{ex.reps}</div>
            <div style={{color:T.textDim,fontSize:9,marginTop:1}}>{ex.dur}</div>
          </div>
        </div>
        <div style={{color:T.textMid,fontSize:12,lineHeight:1.7,marginBottom:10}}>{ex.desc}</div>
        {ex.prec&&(
          <div style={{background:T.amberDim,border:`1px solid ${T.amber}33`,borderRadius:9,padding:"8px 11px",marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:14,flexShrink:0}}>⚠️</span>
            <span style={{color:T.amber,fontSize:12,lineHeight:1.5}}>{ex.prec}</span>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          {onAdd&&(
            <button onClick={()=>onAdd(ex.id)}
              style={{flex:1,background:added?T.green:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:10,padding:"11px 8px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
              {added?"✓ Added to HEP":"+ Add to HEP"}
            </button>
          )}
          {onRemove&&(
            <button onClick={()=>onRemove(ex.id)}
              style={{flex:1,background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:10,padding:"11px 8px",color:T.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
              Remove
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};


const ALL_EX=[
  // ── SHOULDER ──────────────────────────────────────────────────
  {id:"sh1",name:"Shoulder Pendulum",r:"shoulder",sets:3,reps:10,dur:"5 min",diff:"Easy",
   desc:"Lean forward supporting yourself on a table with your good arm. Let the affected arm hang freely. Make small clockwise circles, then counterclockwise. Gravity provides gentle traction.",
   prec:"Stop immediately if sharp or shooting pain occurs.",
   photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Pendulum_exercise.jpg/320px-Pendulum_exercise.jpg"},
  {id:"sh2",name:"Wall Finger Walk",r:"shoulder",sets:3,reps:10,dur:"5 min",diff:"Easy",
   desc:"Stand facing a wall about 12 inches away. Place fingertips on wall at waist level. Walk fingers up as high as comfortable. Hold at top for 5 seconds, then slowly walk back down.",
   prec:"Keep elbow soft, not locked. Do not shrug shoulder up.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=top"},
  {id:"sh3",name:"Shoulder Flexion AROM",r:"shoulder",sets:3,reps:10,dur:"5 min",diff:"Easy",
   desc:"Stand or sit tall. Raise arm forward and upward toward ceiling as high as comfortable. Pause at top, then lower slowly with control. Keep thumb pointing up throughout.",
   prec:"Pain-free range only. Stop at first sign of sharp pain.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop"},
  {id:"sh4",name:"Shoulder Abduction",r:"shoulder",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Stand with arm at side. Raise arm out to the side with thumb pointed up to shoulder height, pause, then lower slowly. Keep your back straight and do not lean to the side.",
   prec:"Avoid scapular hike (shrugging the shoulder up). Go only to pain-free range.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop"},
  {id:"sh5",name:"External Rotation with Band",r:"shoulder",sets:3,reps:12,dur:"7 min",diff:"Medium",
   desc:"Attach resistance band to a doorknob. Stand with elbow at side bent to 90 degrees. Hold band and rotate forearm outward away from body. Slow and controlled return.",
   prec:"Use lightest resistance initially. Keep elbow pinned to your side at all times.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop"},
  {id:"sh6",name:"Scapular Retraction",r:"shoulder",sets:3,reps:15,dur:"4 min",diff:"Easy",
   desc:"Sit or stand tall. Squeeze shoulder blades down and back as if trying to hold a pencil between them. Hold for 5 seconds. Release slowly. Think 'down and back', not just back.",
   prec:"Do not shrug up. Keep neck relaxed throughout.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop"},
  {id:"sh7",name:"Sleeper Stretch",r:"shoulder",sets:3,reps:1,dur:"5 min",diff:"Medium",
   desc:"Lie on affected side with shoulder at 90 degrees. Use opposite hand to gently push forearm toward the bed. Hold 30 seconds. Targets posterior capsule tightness.",
   prec:"Gentle pressure only. Never force — this stretch should feel like a mild pull.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop"},
  {id:"sh8",name:"Towel Slides on Counter",r:"shoulder",sets:2,reps:10,dur:"5 min",diff:"Easy",
   desc:"Place a small towel under your hand on a smooth counter. Keep elbow straight and slide hand forward as far as comfortable, then return. Uses surface to assist the motion.",
   prec:"Keep back straight. Only go to comfortable range.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop"},
  {id:"sh9",name:"Shoulder IR with Band",r:"shoulder",sets:3,reps:12,dur:"6 min",diff:"Medium",
   desc:"Stand with band attached at elbow height. Elbow at 90 degrees, rotate forearm inward toward belly. Slowly return to start. Strengthens subscapularis.",
   prec:"Keep elbow pinned to side. Use lightest band for first 2 weeks.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&crop=right"},
  // ── ELBOW ─────────────────────────────────────────────────────
  {id:"el1",name:"Elbow Flexion & Extension",r:"elbow",sets:3,reps:15,dur:"5 min",diff:"Easy",
   desc:"Sit with arm resting on a table or at your side. Bend elbow slowly bringing hand toward shoulder, then straighten fully. Go through full comfortable range. Both directions matter.",
   prec:"Avoid locking the elbow at full extension. Move slowly and smoothly.",
   photo:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop"},
  {id:"el2",name:"Forearm Pronation & Supination",r:"elbow",sets:3,reps:15,dur:"4 min",diff:"Easy",
   desc:"Hold a hammer or similar object with elbow at 90 degrees. Rotate forearm so palm faces down (pronation), then up (supination). Like turning a doorknob in both directions.",
   prec:"Move from the forearm, not the whole arm. Keep elbow still.",
   photo:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop&crop=left"},
  {id:"el3",name:"Bicep Curl Light Weight",r:"elbow",sets:3,reps:12,dur:"6 min",diff:"Medium",
   desc:"Hold a 1-2 lb weight (or water bottle) with palm up. Keep elbow at side. Bend elbow lifting hand toward shoulder. Lower slowly over 3 seconds. Full range, controlled speed.",
   prec:"Do not swing or use momentum. Only use weight if pain-free.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=right"},
  {id:"el4",name:"Tricep Extension Overhead",r:"elbow",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Sit tall. Raise arm overhead. Support with opposite hand. Bend elbow slowly lowering hand behind head. Straighten elbow back to start. Use light weight as tolerated.",
   prec:"Support the arm throughout. Stop if shoulder discomfort occurs.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=left"},
  // ── WRIST & HAND ──────────────────────────────────────────────
  {id:"w1",name:"Wrist Flexion & Extension",r:"wrist",sets:3,reps:15,dur:"5 min",diff:"Easy",
   desc:"Rest forearm on a table with hand dangling over the edge. Curl wrist up (extension) then down (flexion). Go through full comfortable range. Can hold a light weight as tolerated.",
   prec:"Stop if numbness or tingling occurs in fingers.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=right"},
  {id:"w2",name:"Wrist Radial & Ulnar Deviation",r:"wrist",sets:3,reps:12,dur:"4 min",diff:"Easy",
   desc:"Hold a hammer with thumb pointing up. Move wrist so thumb goes toward ceiling (radial deviation), then toward floor (ulnar deviation). The weight of the hammer provides resistance.",
   prec:"Small controlled range. Stop if sharp wrist pain occurs.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=left"},
  {id:"w3",name:"Putty Pinch Strengthening",r:"wrist",sets:4,reps:20,dur:"4 min",diff:"Hard",
   desc:"Roll putty into a ball. Pinch between thumb and each finger one at a time, holding 3 seconds each. Then full-hand squeeze. Progress putty resistance over time.",
   prec:"Use soft putty initially. Do not force through pain.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=right"},
  {id:"w4",name:"Tendon Glides",r:"wrist",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Start with fingers straight. Bend at knuckles (hook fist). Make a full fist. Then straight fist (fingers flat). Return to straight. Move slowly through each position to glide the flexor tendons.",
   prec:"Critical for carpal tunnel — perform gently, never forcefully.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=bottom"},
  {id:"w5",name:"Finger Spread & Squeeze",r:"wrist",sets:3,reps:10,dur:"3 min",diff:"Easy",
   desc:"Place hand flat on table. Spread all fingers as wide as possible. Hold 3 seconds. Then squeeze fingers together. Can also place rubber band around fingers and spread against resistance.",
   prec:"Comfortable range only. Stop if joint pain increases.",
   photo:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop&crop=bottom"},
  {id:"w6",name:"Thumb Opposition",r:"wrist",sets:3,reps:10,dur:"4 min",diff:"Medium",
   desc:"Touch thumb pad to each fingertip in sequence — index, middle, ring, pinky. Then reverse direction. Focus on making full contact between thumb and each fingertip. Repeat both directions.",
   prec:"Do not force painful range. This is about precision, not strength.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=bottom"},
  {id:"w7",name:"Grip Strengthening",r:"wrist",sets:3,reps:15,dur:"6 min",diff:"Easy",
   desc:"Squeeze a soft foam ball or rolled washcloth in full hand. Hold for 5 seconds, then release slowly. Progress to firmer ball as strength improves over weeks.",
   prec:"No sharp wrist or finger joint pain. Gentle sustained squeeze only.",
   photo:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop&crop=right"},
  // ── NECK ──────────────────────────────────────────────────────
  {id:"n1",name:"Chin Tucks",r:"neck",sets:3,reps:10,dur:"3 min",diff:"Easy",
   desc:"Sit or stand tall. Draw chin straight back making a 'double chin'. The movement is horizontal, not up or down. Hold 5 seconds, release. This corrects forward head posture.",
   prec:"No tilting head up or down. Movement is purely horizontal.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&crop=top"},
  {id:"n2",name:"Neck Rotation",r:"neck",sets:2,reps:10,dur:"4 min",diff:"Easy",
   desc:"Sit tall with chin level. Slowly turn head to the right as far as comfortable, hold 3 seconds. Return to center. Repeat to the left. Do not tilt or tuck chin during rotation.",
   prec:"Stop immediately if dizziness, headache, or ringing in ears occurs.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&crop=right"},
  {id:"n3",name:"Lateral Neck Stretch",r:"neck",sets:2,reps:5,dur:"4 min",diff:"Easy",
   desc:"Sit tall. Tilt right ear toward right shoulder — do not lift the shoulder. Hold 15-20 seconds feeling a gentle stretch on the left side of neck. Use opposite hand to gently increase stretch.",
   prec:"Light stretch only, never force. Stop if arm numbness occurs.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&crop=left"},
  {id:"n4",name:"Cervical Extension Stretch",r:"neck",sets:2,reps:8,dur:"3 min",diff:"Easy",
   desc:"Sit tall. Very gently tilt head back looking toward ceiling. Hold 3 seconds, return to neutral. Move slowly and stop well before any discomfort.",
   prec:"Very gentle — only a few degrees of movement for most patients. Avoid if cervical stenosis.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&crop=bottom"},
  {id:"n5",name:"Neck Isometrics",r:"neck",sets:3,reps:8,dur:"5 min",diff:"Medium",
   desc:"Place hand against forehead. Push head forward against hand — hold 5 sec, do not let head move. Repeat with hand on back of head, then each side. No movement, just sustained contraction.",
   prec:"Very gentle pressure. Stop if headache or neck pain worsens.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=top"},
  // ── TRUNK & CORE ──────────────────────────────────────────────
  {id:"tr1",name:"Seated Trunk Rotation",r:"trunk",sets:3,reps:10,dur:"5 min",diff:"Easy",
   desc:"Sit in chair with arms crossed over chest. Keeping hips facing forward, rotate upper body to the right as far as comfortable, then to the left. Use a consistent rhythm.",
   prec:"Keep hips and knees facing forward at all times. Do not lean or tip.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=left"},
  {id:"tr2",name:"Pelvic Tilts",r:"trunk",sets:3,reps:10,dur:"4 min",diff:"Easy",
   desc:"Lie on back with knees bent, feet flat. Flatten lower back into floor by tightening abdominals and squeezing glutes. Hold 5 seconds, release. You should feel lower back press into floor.",
   prec:"Breathe throughout — do not hold breath. Stay within comfortable range.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=right"},
  {id:"tr3",name:"Bridging",r:"trunk",sets:3,reps:10,dur:"6 min",diff:"Medium",
   desc:"Lie on back, knees bent feet flat. Squeeze glutes and lift hips off floor until body forms a straight line from knees to shoulders. Hold 3 seconds at top, lower slowly. Do not hyperextend back.",
   prec:"Avoid arching lower back at top. Keep feet hip-width apart.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=bottom"},
  {id:"tr4",name:"Seated Marching",r:"trunk",sets:2,reps:20,dur:"5 min",diff:"Easy",
   desc:"Sit tall in chair with hands resting on thighs. Lift one knee toward chest as high as comfortable. Lower and immediately lift opposite knee. Maintain upright posture throughout.",
   prec:"Hold chair sides if balance is a concern. Keep back straight, no hunching.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=top"},
  {id:"tr5",name:"Quadruped Arm & Leg Reach",r:"trunk",sets:2,reps:8,dur:"8 min",diff:"Hard",
   desc:"On hands and knees, find neutral spine. Slowly extend right arm forward and left leg back. Hold 3 seconds. Lower with control. Alternate sides. Focus on keeping hips level.",
   prec:"Only if patient can safely get on the floor. Avoid if wrist or knee pain.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&crop=bottom"},
  {id:"tr6",name:"Standing Side Bends",r:"trunk",sets:2,reps:10,dur:"3 min",diff:"Easy",
   desc:"Stand with feet hip-width apart holding counter for balance. Slide right hand down outer right thigh bending sideways. Feel stretch on left side. Return to upright. Repeat each side.",
   prec:"Hold counter for balance if unsteady. Movement is sideways only — do not twist.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=right"},
  {id:"tr7",name:"Dead Bug",r:"trunk",sets:3,reps:8,dur:"7 min",diff:"Hard",
   desc:"Lie on back. Raise arms to ceiling, knees bent to 90 over hips. Slowly lower right arm overhead and left leg toward floor simultaneously. Return. Alternate sides. Keep lower back flat.",
   prec:"Lower back must stay flat on floor at all times. Reduce range if back arches.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=left"},
  // ── HIP ───────────────────────────────────────────────────────
  {id:"h1",name:"Hip Abduction Side-Lying",r:"hip",sets:3,reps:12,dur:"6 min",diff:"Easy",
   desc:"Lie on your side with body in a straight line. Keeping top leg straight and toes pointing forward, lift 45 degrees. Hold 3 seconds. Lower slowly. Do not let hip roll back.",
   prec:"Keep hips stacked — do not let top hip roll backward during the lift.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=bottom"},
  {id:"h2",name:"Heel Slides",r:"hip",sets:3,reps:10,dur:"5 min",diff:"Easy",
   desc:"Lie on back with legs straight. Slowly slide heel of affected leg toward buttocks by bending knee. Hold briefly, then slide back to start. Keep heel on bed/floor throughout.",
   prec:"Ideal post-hip or knee surgery. Go only to comfortable range — do not force.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=left"},
  {id:"h3",name:"Hip Abduction Standing",r:"hip",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Hold counter with both hands. Stand on unaffected leg. Lift other leg straight out to the side keeping toes pointing forward. Lower slowly. Stand tall — do not lean away from the lifting leg.",
   prec:"Stay tall throughout. Do not lean body to compensate. Use counter as needed.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=bottom"},
  {id:"h4",name:"Standing Hip Extension",r:"hip",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Hold counter for balance. Keeping knee straight, lift leg straight back behind you. Squeeze glutes at top. Lower with control. Keep trunk upright — do not arch lower back.",
   prec:"Do not arch the lower back to compensate. Small range is fine.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=top"},
  {id:"h5",name:"Clamshells",r:"hip",sets:3,reps:12,dur:"5 min",diff:"Medium",
   desc:"Lie on side with hips bent to 45 degrees and knees bent. Keep feet together and open top knee like a clamshell. Hold 3 seconds at top. Lower slowly. Targets hip abductors and external rotators.",
   prec:"Do not roll the pelvis back to compensate. Only the knee should move.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&crop=right"},
  {id:"h6",name:"Mini-Squats at Counter",r:"hip",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Stand behind counter. Lightly hold counter for balance. Feet hip-width, toes slightly out. Bend knees 20-30 degrees as if beginning to sit. Squeeze glutes as you stand back up. Knees track over toes.",
   prec:"Knees should not collapse inward. Avoid deep squat post hip replacement.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&crop=top"},
  {id:"h7",name:"Hip Flexor Stretch Standing",r:"hip",sets:2,reps:1,dur:"5 min",diff:"Easy",
   desc:"Stand in stride position with affected leg behind. Hold counter. Tuck pelvis slightly and shift weight forward to feel stretch in front of the back hip. Hold 30 seconds.",
   prec:"Keep back upright. Do not lean forward. Hold something sturdy for balance.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=right"},
  {id:"h8",name:"Supine Hip Flexion",r:"hip",sets:3,reps:10,dur:"4 min",diff:"Easy",
   desc:"Lie on back. Bring one knee toward chest as far as comfortable. Hold behind knee if needed. Hold 5 seconds. Lower slowly. Alternate legs. Good for hip mobility post-surgery.",
   prec:"Post-THA: Do not bring knee above 90 degrees if hip precautions are in effect.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=top"},
  // ── KNEE ──────────────────────────────────────────────────────
  {id:"k1",name:"Quad Sets",r:"knee",sets:3,reps:10,dur:"4 min",diff:"Easy",
   desc:"Lie on back with leg straight. Tighten thigh muscle (quadriceps) by pressing knee down toward floor. You should feel the muscle firm up. Hold 5 seconds. Release. Switch legs.",
   prec:"No equipment needed. Safe even with significant swelling. Start here post-surgery.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=right"},
  {id:"k2",name:"Short-Arc Quads",r:"knee",sets:3,reps:12,dur:"5 min",diff:"Easy",
   desc:"Lie on back with a rolled towel under the knee. Straighten knee fully by tightening quad. Hold 3 seconds at top. Lower slowly. The towel keeps the thigh still while the lower leg moves.",
   prec:"Keep thigh resting on towel throughout. Stop if sharp knee pain.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=bottom"},
  {id:"k3",name:"Long-Arc Quads",r:"knee",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Sit in a chair. Straighten one knee fully until leg is horizontal. Hold 3 seconds. Lower slowly over 3 seconds. Can add ankle weight (1-2 lbs) as tolerated.",
   prec:"Stop if sharp or severe knee pain. Patellofemoral pain may worsen with weights.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=right"},
  {id:"k4",name:"Hamstring Curls Standing",r:"knee",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Hold counter for balance standing on good leg. Bend knee of affected leg bringing heel toward buttocks. Keep thighs aligned — do not let the bending knee move forward or backward. Lower slowly.",
   prec:"Keep both thighs parallel. Do not lean forward or arch back.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&crop=left"},
  {id:"k5",name:"Wall Sit",r:"knee",sets:2,reps:1,dur:"5 min",diff:"Hard",
   desc:"Stand with back against wall. Slowly slide down until thighs are at roughly 45-90 degrees (mini squat position). Hold 10-30 seconds as tolerated. Slide back up. Rest 30 seconds between sets.",
   prec:"No deep squat position (below parallel). Stop if knee pain increases above 4/10.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=left"},
  {id:"k6",name:"Step-Ups Low Step",r:"knee",sets:2,reps:10,dur:"6 min",diff:"Hard",
   desc:"Stand in front of a 4-inch step. Step up with affected leg, bring other foot up, then step down leading with the good leg. Focus on slow controlled descent. Hold railing as needed.",
   prec:"Use railing at all times for safety. Do not attempt if significant knee pain.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=left"},
  {id:"k7",name:"Heel Raises",r:"knee",sets:3,reps:15,dur:"4 min",diff:"Easy",
   desc:"Stand behind counter holding lightly for balance. Rise up onto toes of both feet. Hold 2 seconds at top. Lower slowly over 3 seconds. Strengthens calf and improves ankle-knee stability.",
   prec:"No jerking motion. Lower slowly — the eccentric phase is most important.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=top"},
  {id:"k8",name:"Terminal Knee Extension Band",r:"knee",sets:3,reps:15,dur:"5 min",diff:"Medium",
   desc:"Attach resistance band behind knee. Stand with slight knee bend. Straighten knee against band resistance. Hold 2 seconds. Return slowly. Isolates quad without full range needed.",
   prec:"Ensure band is securely anchored. Keep foot flat on floor throughout.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&crop=right"},
  // ── ANKLE & FOOT ──────────────────────────────────────────────
  {id:"a1",name:"Ankle Pumps",r:"ankle",sets:3,reps:20,dur:"3 min",diff:"Easy",
   desc:"Sit or lie with leg elevated. Point toes away from you (plantarflexion), then pull toes up toward shin (dorsiflexion). Move briskly and rhythmically. Excellent for circulation and DVT prevention.",
   prec:"Great for post-surgical patients on bed rest. Can be done throughout the day.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=top"},
  {id:"a2",name:"Ankle Circles",r:"ankle",sets:2,reps:10,dur:"3 min",diff:"Easy",
   desc:"Sit with foot elevated or hanging. Draw slow circles with your foot — 10 clockwise, then 10 counterclockwise. The movement should come from the ankle, not the whole leg.",
   prec:"Move from the ankle, not the knee or hip. Keep leg still.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=left"},
  {id:"a3",name:"Towel Scrunches",r:"ankle",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Sit barefoot with a small towel on the floor. Use toes to scrunch and pull the towel toward you. Release. Repeat. Strengthens the intrinsic foot muscles and helps with plantar fasciitis and neuropathy.",
   prec:"Use a thin towel initially. Helps specifically with toe flexor weakness.",
   photo:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop&crop=left"},
  {id:"a4",name:"Heel Walks",r:"ankle",sets:2,reps:1,dur:"3 min",diff:"Medium",
   desc:"Stand near a wall for support. Walk 10 feet forward on your heels with toes lifted off the floor. Then walk back. Strengthens anterior tibialis and helps with foot drop.",
   prec:"Use wall or hallway for support. Stop if ankle gives way.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=right"},
  {id:"a5",name:"Toe Walks",r:"ankle",sets:2,reps:1,dur:"3 min",diff:"Medium",
   desc:"Stand near a wall. Rise up on toes and walk 10 feet forward. Walk back on toes. Strengthens calf complex and improves ankle stability.",
   prec:"Hold support if unsteady. Stop if calf cramping occurs.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=right"},
  {id:"a6",name:"Marble Pickups",r:"ankle",sets:2,reps:10,dur:"5 min",diff:"Hard",
   desc:"Sit with a cup and 10 marbles on the floor. Using only your toes, pick up one marble at a time and drop it in the cup. Excellent for peripheral neuropathy and foot intrinsic strengthening.",
   prec:"Good for neuropathy patients. May use small rocks or crumpled paper if marbles unavailable.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=right"},
  {id:"a7",name:"Calf Stretch Standing",r:"ankle",sets:3,reps:1,dur:"4 min",diff:"Easy",
   desc:"Stand facing a wall with hands on wall. Step affected foot back. Keep back knee straight and back heel flat on floor. Lean toward wall to feel stretch in back calf. Hold 30 seconds.",
   prec:"Keep back heel down throughout. Do not bounce.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=top"},
  {id:"a8",name:"Resistance Band Dorsiflexion",r:"ankle",sets:3,reps:15,dur:"5 min",diff:"Medium",
   desc:"Sit with leg extended. Loop band around foot. Pull toes up toward shin against band resistance. Lower slowly. Strengthens anterior tibialis and prevents foot drop.",
   prec:"Ensure band is securely anchored. Move at the ankle only.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&crop=top"},
  // ── BALANCE & GAIT ────────────────────────────────────────────
  {id:"b1",name:"Single Leg Stand",r:"balance",sets:3,reps:1,dur:"5 min",diff:"Medium",
   desc:"Stand near counter. Lift one foot slightly off floor. Balance on standing leg for 10-30 seconds. Progress from eyes open to eyes closed as tolerated. Switch legs.",
   prec:"Always have counter within arm's reach. Do not attempt without support nearby.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=top"},
  {id:"b2",name:"Weight Shifts Side to Side",r:"balance",sets:3,reps:15,dur:"4 min",diff:"Easy",
   desc:"Stand behind counter feet hip-width apart. Shift weight slowly to right foot, hold 3 seconds. Shift to left, hold 3 seconds. Then shift front and back. Keep upright posture throughout.",
   prec:"Smooth, controlled shifts. Hold counter initially until confidence builds.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=top"},
  {id:"b3",name:"Sit to Stand",r:"balance",sets:3,reps:10,dur:"5 min",diff:"Medium",
   desc:"Sit at edge of firm chair. Scoot forward. Lean trunk slightly forward over feet. Push up to standing using legs — not arms. Lower slowly and controlled. Sit back gently.",
   prec:"Use armrests for safety initially. Progress to arms folded across chest.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=top"},
  {id:"b4",name:"Tandem Stance",r:"balance",sets:3,reps:1,dur:"5 min",diff:"Medium",
   desc:"Stand near counter. Place one foot directly in front of other — heel touching toe. Hold this narrow stance for 20-30 seconds. Switch foot positions. Progress to eyes closed.",
   prec:"Have counter within reach at all times. This is a significant balance challenge.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=left"},
  {id:"b5",name:"Heel-to-Toe Walking",r:"balance",sets:2,reps:10,dur:"5 min",diff:"Hard",
   desc:"Walk down a hallway placing heel directly in front of opposite toe with each step. Arms out for balance. Walk 10 steps forward and back. Focus on quality of each step.",
   prec:"Use hallway wall for hand support. Have someone nearby for first session.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=left"},
  {id:"b6",name:"Side-Stepping",r:"balance",sets:2,reps:10,dur:"5 min",diff:"Medium",
   desc:"Stand sideways in hallway. Step to the right with right foot, bring left foot to meet it. Take 10 steps right, then 10 steps left. Keep feet parallel and posture upright throughout.",
   prec:"Upright posture. Do not cross feet over each other.",
   photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&crop=right"},
  {id:"b7",name:"Marching Eyes Closed",r:"balance",sets:2,reps:20,dur:"4 min",diff:"Hard",
   desc:"Hold counter with both hands. Close eyes. March in place by lifting each knee to hip height alternately. Start 10 seconds and build duration. Challenges vestibular and proprioceptive balance.",
   prec:"Spotter required. Keep firm grip on counter. Do not attempt without supervision.",
   photo:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&crop=right"},
  {id:"b8",name:"Foam Pad Standing",r:"balance",sets:3,reps:1,dur:"6 min",diff:"Hard",
   desc:"Stand on foam pad or folded blanket with feet together. Hold counter nearby. Balance 20-30 seconds. Unstable surface challenges proprioception and ankle stability.",
   prec:"Always have solid support within reach. Do not attempt without therapist present first.",
   photo:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&crop=bottom"},
  // ── COGNITIVE & ADL ───────────────────────────────────────────
  {id:"c1",name:"Morning Routine Sequencing",r:"cognitive",sets:1,reps:1,dur:"15 min",diff:"Medium",
   desc:"Practice the morning self-care routine in the correct sequence using visual cue cards. Each step — washing face, brushing teeth, dressing — is practiced in order with adaptive equipment as needed.",
   prec:"Modify sequence for patient cognitive level. Use visual cues and verbal prompts.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=top"},
  {id:"c2",name:"Meal Prep Practice",r:"cognitive",sets:1,reps:1,dur:"30 min",diff:"Hard",
   desc:"Plan and prepare a simple one-dish meal following a recipe. Practice sequencing, reading, and fine motor skills simultaneously. Therapist grades assistance based on performance.",
   prec:"Complete stovetop safety evaluation first. Supervise at all times.",
   photo:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop&crop=top"},
  {id:"c3",name:"Medication Management",r:"cognitive",sets:1,reps:1,dur:"10 min",diff:"Medium",
   desc:"Sort medications into a weekly pill organizer following a written schedule. Read labels, identify pills, and place correctly. Caregiver verifies for safety.",
   prec:"Caregiver must verify accuracy before patient uses independently.",
   photo:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop&crop=bottom"},
  {id:"c4",name:"Dressing Techniques",r:"cognitive",sets:1,reps:1,dur:"20 min",diff:"Medium",
   desc:"Practice dressing with adaptive techniques — dressing affected side first, using reacher for lower body, and button hook for shirts. Goal is maximum independence with minimum assistance.",
   prec:"Seated position for safety. Use adaptive equipment as needed.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=bottom"},
  {id:"c5",name:"Energy Conservation 4 Ps",r:"cognitive",sets:1,reps:1,dur:"20 min",diff:"Medium",
   desc:"Practice daily activities using the 4 Ps: Pace, Plan, Prioritize, and Position. Identify which activities are high vs. low priority. Practice rest breaks and activity pacing.",
   prec:"Monitor O2 saturation if available. Watch for dyspnea or excessive fatigue.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&crop=bottom"},
  // ── BREATHING ─────────────────────────────────────────────────
  {id:"br1",name:"Diaphragmatic Breathing",r:"breathing",sets:3,reps:10,dur:"5 min",diff:"Easy",
   desc:"Lie or sit comfortably. Place one hand on chest, one on belly. Inhale slowly through nose for 4 seconds — belly should rise, chest stays still. Exhale through pursed lips for 6 seconds. Belly falls.",
   prec:"Excellent for COPD, anxiety, and general respiratory conditioning.",
   photo:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&crop=left"},
  {id:"br2",name:"Pursed-Lip Breathing",r:"breathing",sets:3,reps:10,dur:"4 min",diff:"Easy",
   desc:"Inhale slowly through nose for 2 seconds. Purse lips as if blowing out a candle. Exhale slowly for 4 seconds — twice as long as the inhale. This keeps airways open longer.",
   prec:"Use during activities that cause dyspnea — stair climbing, dressing, bathing.",
   photo:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=left"},
  {id:"br3",name:"Incentive Spirometry",r:"breathing",sets:3,reps:10,dur:"5 min",diff:"Easy",
   desc:"Place mouthpiece in lips. Breathe out normally then breathe in slowly and deeply through the spirometer to raise the piston as high as possible. Hold 3 seconds. Rest 30 seconds between breaths.",
   prec:"Post-surgical patients: prevents atelectasis. Use the device provided by hospital.",
   photo:"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&crop=top"},
  {id:"br4",name:"Active Cycle of Breathing",r:"breathing",sets:2,reps:1,dur:"8 min",diff:"Medium",
   desc:"Breathing control (relaxed), 3-4 thoracic expansion exercises (big breaths), then a forced expiration (huff) to clear secretions. Complete one full cycle. Used for patients with secretion retention.",
   prec:"Used with COPD, bronchiectasis, or post-op patients. Teach each phase separately.",
   photo:"https://images.unsplash.com/photo-1559771126-56b1a2ffab3f?w=600&h=400&fit=crop&crop=bottom"},
];
const DX_TEMPLATES=[
  {id:"dx1",name:"Post-TKA",icon:"🦿",color:"#F43F5E",exs:["k1","k2","k3","k4","b2","b3","a1","h6"],notes:"Quad activation first week, progress to terminal extension and step training. WB as tolerated."},
  {id:"dx2",name:"Post-THA",icon:"🦵",color:"#EC4899",exs:["h2","h8","h1","a1","k1","b2","b3","tr2"],notes:"Hip precautions: no flexion >90°, no IR, no crossing legs. WB as tolerated per surgeon."},
  {id:"dx3",name:"CVA / Stroke",icon:"🧠",color:"#8B5CF6",exs:["c1","c4","b2","b3","b5","w2","w4","w7","tr1"],notes:"ADL retraining, affected UE strengthening, and balance critical. Assess dysphagia separately."},
  {id:"dx4",name:"Parkinson's Disease",icon:"🧬",color:"#7C5AF8",exs:["b2","b3","b4","tr1","c1","br1","b6","tr4"],notes:"LSVT BIG principles — large amplitude movements. External rhythmic cueing essential."},
  {id:"dx5",name:"COPD / Dyspnea",icon:"🫁",color:"#0DC8A4",exs:["br1","br2","br3","br4","c5","b2","b3","a1"],notes:"Energy conservation is priority #1. Monitor SpO2 — stop if <92%. Pace all activities."},
  {id:"dx6",name:"Shoulder Replacement (TSA)",icon:"💪",color:"#2D7EF8",exs:["sh1","sh6","sh7","sh8","sh3","sh2","el1","el2"],notes:"Sling use per surgeon protocol. PROM only first 6 weeks. Progress to AROM after clearance."},
  {id:"dx7",name:"Rotator Cuff Repair",icon:"💪",color:"#3B82F6",exs:["sh1","sh6","sh8","sh2","sh3","el1","el2","sh7"],notes:"Strict WB restrictions. No active ER against gravity early. Progress per surgical timeline."},
  {id:"dx8",name:"Hip Fracture (ORIF)",icon:"🦴",color:"#F59E0B",exs:["h2","h8","a1","k1","b2","b3","h1","tr2"],notes:"WB status per surgeon. Fall prevention education is critical. DME assessment needed."},
  {id:"dx9",name:"Low Back Pain",icon:"🦴",color:"#10B981",exs:["tr2","tr1","tr3","tr7","b2","b3","n1","h7"],notes:"Core stability is foundational. Avoid end-range lumbar flexion acutely. Progress to dynamic exercises."},
  {id:"dx10",name:"Carpal Tunnel Syndrome",icon:"✋",color:"#06B6D4",exs:["w4","w1","w2","w5","w6","el2","w7"],notes:"Nerve gliding exercises are critical. Splint at night. Ergonomic education for ADLs."},
  {id:"dx11",name:"Rheumatoid Arthritis",icon:"🤲",color:"#F59E0B",exs:["w5","w6","w7","w1","el1","sh6","a1"],notes:"Joint protection principles first. Avoid high-repetition gripping. Warm up before exercise."},
  {id:"dx12",name:"Ankle Fracture",icon:"🦶",color:"#F59E0B",exs:["a1","a2","k7","a3","a8","b2","b3","a7"],notes:"WB per surgeon orders. Edema management with elevation and pumps. Progress to proprioception."},
  {id:"dx13",name:"Total Shoulder Replacement",icon:"💪",color:"#7C3AED",exs:["sh1","sh6","sh8","sh9","sh3","el1","el2","sh7"],notes:"Similar to TSA protocol. Verify with surgical team re: posterior capsule restrictions."},
  {id:"dx14",name:"Balance & Fall Risk",icon:"⚖️",color:"#10B981",exs:["b1","b2","b3","b4","b5","b6","b7","b8"],notes:"Complete Berg Balance Scale at initial eval. Target vestibular, proprioceptive, and visual systems."},
  {id:"dx15",name:"Cardiac Rehab Post-Op",icon:"❤️",color:"#F43F5E",exs:["br1","br2","a1","b2","b3","c5","tr2","tr4"],notes:"Monitor HR and BP. Stay within target HR zone. Stop if chest pain, dizziness, or dyspnea."},
  {id:"dx16",name:"Spinal Cord Injury (Incomplete)",icon:"🧬",color:"#8B5CF6",exs:["c1","b2","b3","tr2","tr1","c4","br1","w7"],notes:"Grade ASIA impairment. Focus on preserved function. Wheelchair positioning if needed."},
  {id:"dx17",name:"TBI / Head Injury",icon:"🧠",color:"#EC4899",exs:["c1","c4","b2","b3","n1","br1","c5","tr1"],notes:"Cognitive and physical deficits addressed simultaneously. Fatigue management critical."},
  {id:"dx18",name:"Wrist Fracture (Colles')",icon:"✋",color:"#2D7EF8",exs:["w1","w2","w5","w6","el1","el2","w4","w7"],notes:"Initiate early ROM after cast removal. Edema management throughout. Progress grip last."},
];

// ─── MOCK PATIENTS (full clinical info) ───────────────────────
const PATIENTS_DB=[
  {id:"p1",name:"Maria Santos",age:68,dob:"1958-03-12",phone:"(305) 555-0142",
   addr:"842 SW 23rd Ave, Miami, FL 33135",lat:25.762,lng:-80.213,
   emergency:{name:"Carlos Santos (Son)",phone:"(305) 555-0199"},
   insurance:"Medicare Part A",insuranceId:"1EG4-TE5-MK72",
   physician:"Dr. Elena Reyes",physicianPhone:"(305) 555-2100",
   cond:"Post-Hip Replacement (Right THA)",risk:"high",adh:42,agencyId:"ag1",clinicianId:"c1",
   hep:["h2","h1","a1","k1","b2"],dx:"Post-THA",
   allergies:"Penicillin, Sulfa drugs",
   precautions:"Hip precautions: No flexion >90°. Fall risk HIGH. WBAT.",
   notes:"Patient lives alone. Daughter visits weekends. Home has 3 steps at entrance.",
   vitals:{bp:"132/84",hr:"72",o2:"97%",weight:"154 lbs"},
   files:[
     {id:"f1",name:"Discharge Summary.pdf",type:"pdf",size:"1.2 MB",date:"2026-05-10",category:"Discharge"},
     {id:"f2",name:"Initial Eval Report.pdf",type:"pdf",size:"890 KB",date:"2026-05-11",category:"Evaluation"},
     {id:"f3",name:"X-Ray Report.pdf",type:"pdf",size:"2.1 MB",date:"2026-05-08",category:"Imaging"},
     {id:"f4",name:"Insurance Auth.pdf",type:"pdf",size:"340 KB",date:"2026-05-09",category:"Insurance"},
     {id:"f5",name:"HEP Handout.pdf",type:"pdf",size:"560 KB",date:"2026-05-12",category:"HEP"},
   ],
   visits:[{date:dAgo(6),type:"soc",status:"approved"},{date:dAgo(3),type:"followup",status:"approved"}],
   // Scheduling
   scheduleFreq:"2w4", scheduleDays:["Mon","Thu"], scheduleStartDate:"2026-05-11"},
  {id:"p2",name:"James Okafor",age:55,dob:"1971-07-25",phone:"(305) 555-0387",
   addr:"1120 NW 14th St, Miami, FL 33136",lat:25.797,lng:-80.213,
   emergency:{name:"Amara Okafor (Wife)",phone:"(305) 555-0400"},
   insurance:"Medicare Part B",insuranceId:"2FH5-UK6-NL83",
   physician:"Dr. Michael Kim",physicianPhone:"(305) 555-3300",
   cond:"CVA / Left Hemiplegia",risk:"medium",adh:71,agencyId:"ag1",clinicianId:"c1",
   hep:["c1","b2","b3","w2"],dx:"CVA / Stroke",
   allergies:"None known",precautions:"Fall risk MODERATE. Left side weakness.",
   notes:"Right-hand dominant. Good engagement. Motivated patient.",
   vitals:{bp:"128/78",hr:"68",o2:"98%",weight:"182 lbs"},
   files:[
     {id:"f6",name:"Stroke Discharge.pdf",type:"pdf",size:"1.8 MB",date:"2026-05-05",category:"Discharge"},
     {id:"f7",name:"MRI Report.pdf",type:"pdf",size:"3.2 MB",date:"2026-05-04",category:"Imaging"},
     {id:"f8",name:"OT Eval.pdf",type:"pdf",size:"720 KB",date:"2026-05-06",category:"Evaluation"},
   ],
   visits:[{date:dAgo(5),type:"eval",status:"approved"},{date:dAgo(2),type:"followup",status:"pending"}],
   scheduleFreq:"3w6", scheduleDays:["Mon","Wed","Fri"], scheduleStartDate:"2026-05-06"},
  {id:"p3",name:"Dorothy Chen",age:74,dob:"1952-11-04",phone:"(305) 555-0521",
   addr:"3355 Bird Rd, Miami, FL 33133",lat:25.745,lng:-80.277,
   emergency:{name:"Linda Chen (Daughter)",phone:"(305) 555-0600"},
   insurance:"Humana PPO",insuranceId:"HUM-2024-88421",
   physician:"Dr. Sarah Wong",physicianPhone:"(305) 555-4400",
   cond:"Parkinson's Disease (Stage 2)",risk:"low",adh:88,agencyId:"ag1",clinicianId:"c2",
   hep:["b2","b3","tr1","c1","br1"],dx:"Parkinson's",
   allergies:"Codeine",precautions:"Freezing episodes possible. Cueing strategies needed.",
   notes:"Very motivated. Participates in tai chi 2x/week.",
   vitals:{bp:"118/72",hr:"64",o2:"99%",weight:"128 lbs"},
   files:[
     {id:"f9",name:"Neurology Report.pdf",type:"pdf",size:"1.1 MB",date:"2026-04-20",category:"Specialist"},
     {id:"f10",name:"Parkinson's Care Plan.pdf",type:"pdf",size:"645 KB",date:"2026-05-01",category:"Care Plan"},
   ],
   visits:[{date:dAgo(6),type:"soc",status:"approved"},{date:dAgo(4),type:"followup",status:"approved"}],
   scheduleFreq:"2w8", scheduleDays:["Tue","Thu"], scheduleStartDate:"2026-05-05"},
  {id:"p4",name:"Robert Dziedzic",age:80,dob:"1946-02-18",phone:"(305) 555-0618",
   addr:"510 Coral Way, Miami, FL 33134",lat:25.755,lng:-80.248,
   emergency:{name:"Anna Dziedzic (Wife)",phone:"(305) 555-0700"},
   insurance:"Medicare Part A",insuranceId:"3JK7-MN8-OP94",
   physician:"Dr. Carlos Mendez",physicianPhone:"(305) 555-5500",
   cond:"Hip Fracture Post-ORIF",risk:"high",adh:55,agencyId:"ag1",clinicianId:"c3",
   hep:["h2","a1","k1","b2","b3"],dx:"Hip Fracture (ORIF)",
   allergies:"Aspirin, Latex",precautions:"WBAT right hip. Fall risk HIGH. Cardiac history.",
   notes:"Lives with wife. Two-story home — sleeping on first floor.",
   vitals:{bp:"145/90",hr:"76",o2:"95%",weight:"201 lbs"},
   files:[
     {id:"f11",name:"ORIF Discharge.pdf",type:"pdf",size:"2.0 MB",date:"2026-05-12",category:"Discharge"},
     {id:"f12",name:"Surgical Report.pdf",type:"pdf",size:"1.5 MB",date:"2026-05-08",category:"Surgical"},
     {id:"f13",name:"Home Safety Eval.pdf",type:"pdf",size:"480 KB",date:"2026-05-14",category:"Evaluation"},
     {id:"f14",name:"DME Order.pdf",type:"pdf",size:"220 KB",date:"2026-05-13",category:"Orders"},
   ],
   visits:[{date:dAgo(5),type:"eval",status:"approved"},{date:dAgo(2),type:"followup",status:"approved"}],
   scheduleFreq:"2w4", scheduleDays:["Mon","Thu"], scheduleStartDate:"2026-05-13"},
];

const CLINICIANS=[
  {id:"c1",name:"Dr. Aisha Patel",role:"OT",agencyIds:["ag1","ag2"],status:"available",lat:25.790,lng:-80.200,
   customRates:{ag1:{soc:130,eval:120,followup:85,cosign:45,nonvisit:35,otdc:110},ag2:{soc:140,eval:130,followup:90,cosign:50,nonvisit:38,otdc:115}}},
  {id:"c2",name:"Marcus Williams",role:"COTA",agencyIds:["ag1"],status:"in-visit",lat:25.768,lng:-80.189,
   customRates:{ag1:{soc:115,eval:105,followup:75,cosign:40,nonvisit:30,otdc:100}}},
  {id:"c3",name:"Lena Fischer",role:"OT",agencyIds:["ag1"],status:"available",lat:25.779,lng:-80.220,
   customRates:{ag1:{soc:120,eval:110,followup:80,cosign:42,nonvisit:32,otdc:105}}},
];

const AGENCIES=[
  {id:"ag1",name:"SunCare Home Health",logo:"☀️",plan:"growth",city:"Miami, FL",invoicePeriod:"biweekly"},
  {id:"ag2",name:"Pacific Recovery Group",logo:"🌊",plan:"enterprise",city:"San Diego, CA",invoicePeriod:"monthly"},
];

const DEF_RATES={ag1:{soc:125,eval:115,followup:80,cosign:42,nonvisit:32,otdc:108}};

const INIT_VISITS=[
  {id:"v1",clinicianId:"c1",patientId:"p1",agencyId:"ag1",type:"soc",      date:dAgo(6), status:"approved",notes:"Initial SOC"},
  {id:"v2",clinicianId:"c1",patientId:"p2",agencyId:"ag1",type:"eval",     date:dAgo(5), status:"approved",notes:"Eval completed"},
  {id:"v3",clinicianId:"c1",patientId:"p1",agencyId:"ag1",type:"followup", date:dAgo(3), status:"approved",notes:"Progress noted"},
  {id:"v4",clinicianId:"c1",patientId:"p2",agencyId:"ag1",type:"followup", date:dAgo(2), status:"pending",notes:""},
  {id:"v5",clinicianId:"c2",patientId:"p3",agencyId:"ag1",type:"soc",      date:dAgo(6), status:"approved",notes:"SOC Parkinson's"},
  {id:"v6",clinicianId:"c2",patientId:"p3",agencyId:"ag1",type:"followup", date:dAgo(4), status:"approved",notes:""},
  {id:"v7",clinicianId:"c3",patientId:"p4",agencyId:"ag1",type:"eval",     date:dAgo(5), status:"approved",notes:"Eval post-ORIF"},
  {id:"v8",clinicianId:"c3",patientId:"p4",agencyId:"ag1",type:"followup", date:dAgo(2), status:"approved",notes:""},
  {id:"v9",clinicianId:"c1",patientId:"p1",agencyId:"ag1",type:"followup", date:dFwd(1), status:"scheduled",notes:""},
  {id:"v10",clinicianId:"c1",patientId:"p2",agencyId:"ag1",type:"followup",date:dFwd(3), status:"scheduled",notes:""},
  {id:"v11",clinicianId:"c1",patientId:"p1",agencyId:"ag1",type:"followup",date:dFwd(5), status:"scheduled",notes:""},
  {id:"v12",clinicianId:"c1",patientId:"p2",agencyId:"ag1",type:"cosign",  date:dFwd(6), status:"scheduled",notes:""},
];

const INIT_REFERRALS=[
  {id:"r1",name:"Gloria Reyes",age:71,dx:"Post-TKA rehabilitation – right knee. Limited ROM, pain 6/10. Gait training, ADL retraining needed.",insurance:"Medicare A",urgency:"high",lat:25.782,lng:-80.192,addr:"842 SW 23rd Ave, Miami, FL",sentBy:"Miami General",sentAt:"2h ago",status:"open",agencyId:"ag1"},
  {id:"r2",name:"Arthur Mbeki",age:58,dx:"CVA ischemic – left hemiplegia. UE strengthening, cognitive ADL retraining.",insurance:"Medicare B",urgency:"high",lat:25.797,lng:-80.213,addr:"1120 NW 14th St, Miami, FL",sentBy:"Jackson Memorial",sentAt:"5h ago",status:"open",agencyId:"ag1"},
  {id:"r3",name:"Sandra Kim",age:62,dx:"Shoulder replacement (TSA right). PROM per protocol, sling education, ADL mod.",insurance:"Blue Cross",urgency:"medium",lat:25.755,lng:-80.205,addr:"720 Sunset Dr, Miami, FL",sentBy:"Mount Sinai",sentAt:"1d ago",status:"open",agencyId:"ag1"},
];

// ─── SHARED COMPONENTS ────────────────────────────────────────
const Ico=({n,s=20,c="currentColor"})=>{
  const d={
    home:<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>,
    users:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    visits:<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    inv:<><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></>,
    dollar:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
    back:<><path d="M15 18l-6-6 6-6"/></>,
    plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    chk:<><polyline points="20,6 9,17 4,12"/></>,
    out:<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
    cal:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    hep:<><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></>,
    map:<><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
    ref:<><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></>,
    search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    phone:<><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></>,
    nav:<><polygon points="3,11 22,2 13,21 11,13 3,11"/></>,
    set:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9z"/></>,
    file:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></>,
    folder:<><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></>,
    camera:<><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>,
    chat:<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    star:<><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
    shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    pin:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    repeat:<><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>,
    eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    upload:<><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></>,
    ai:<><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    alert:<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d[n]}</svg>;
};

const useT=()=>{const{dark}=useTheme();return dark?DARK_T:LIGHT_T;};
const Tag=({label,color,bg,sz=10})=>{
  const{dark}=useTheme();
  return <span style={{fontSize:sz,fontWeight:700,color,background:dark?bg:`${color}22`,borderRadius:20,padding:"3px 9px",letterSpacing:"0.4px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;
};
const Card=({children,style={},onClick})=>{
  const T=useT();
  return <div onClick={onClick} style={{background:T.surface,borderRadius:15,padding:"13px 15px",marginBottom:9,border:`1px solid ${T.border}`,cursor:onClick?"pointer":"default",boxShadow:useTheme().dark?"none":"0 1px 4px rgba(0,0,0,.10)",...style}}>{children}</div>;
};
const Stat=({label,value,color,sub})=>{
  const T=useT();
  return <Card style={{marginBottom:0,padding:"14px"}}><div style={{color,fontSize:22,fontWeight:900,letterSpacing:-0.5}}>{value}</div><div style={{color:T.textMid,fontSize:11,marginTop:2}}>{label}</div>{sub&&<div style={{color,fontSize:10,marginTop:2}}>{sub}</div>}</Card>;
};
const Shell=({children,tabs,active,setTab,onLogout,title,subtitle,accent})=>{
  const{dark,setDark}=useTheme();const T=dark?DARK_T:LIGHT_T;
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font,maxWidth:430,margin:"0 auto",paddingBottom:88}}>
      <div style={{padding:"46px 18px 14px",background:`linear-gradient(180deg,${T.surface} 0%,${T.bg} 100%)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:T.textDim,fontSize:10,letterSpacing:"0.9px",textTransform:"uppercase",marginBottom:2}}>{subtitle}</div>
            <div style={{color:T.text,fontSize:18,fontWeight:800,letterSpacing:-0.4}}>{title}</div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>setDark(d=>!d)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 11px",cursor:"pointer",fontSize:15,lineHeight:1}}>{dark?"☀️":"🌙"}</button>
            <button onClick={onLogout} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 11px",cursor:"pointer"}}><Ico n="out" s={15} c={T.textMid}/></button>
          </div>
        </div>
      </div>
      <div style={{padding:"0 16px"}}>{children}</div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:dark?"#060C18":T.surface,borderTop:`1px solid ${T.border}`,display:"flex",padding:"10px 0 22px"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <Ico n={t.icon} s={19} c={active===t.id?accent:T.textDim}/>
            <span style={{fontSize:9,fontWeight:700,color:active===t.id?accent:T.textDim,letterSpacing:"0.3px"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── MAP VIEW ─────────────────────────────────────────────────
const MapView=({referrals,clinicians,onSelect,selectedId})=>{
  const T=useT();
  const W=370,H=200;
  const minLat=25.735,maxLat=25.810,minLng=-80.240,maxLng=-80.165;
  const tx=lng=>((lng-minLng)/(maxLng-minLng))*W;
  const ty=lat=>((maxLat-lat)/(maxLat-minLat))*H;
  return(
    <div style={{position:"relative",background:"#0B1825",borderRadius:13,overflow:"hidden",border:`1px solid ${T.border}`,marginBottom:13}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
        {[0,1,2].map(i=><line key={i} x1="0" y1={H/3*i} x2={W} y2={H/3*i} stroke="#152030" strokeWidth="0.5"/>)}
        <path d={`M 0,${ty(25.782)} L ${W},${ty(25.782)}`} stroke="#1E3A5F" strokeWidth="1.5" opacity="0.6"/>
        <path d={`M ${tx(-80.200)},0 L ${tx(-80.200)},${H}`} stroke="#1E3A5F" strokeWidth="1.5" opacity="0.6"/>
        {clinicians.map(cl=>(
          <g key={cl.id}>
            <circle cx={tx(cl.lng)} cy={ty(cl.lat)} r="12" fill="#0DC8A4" opacity="0.12"/>
            <circle cx={tx(cl.lng)} cy={ty(cl.lat)} r="6" fill="#0DC8A4" opacity="0.9"/>
            <text x={tx(cl.lng)} y={ty(cl.lat)+16} textAnchor="middle" fill="#0DC8A4" fontSize="7" fontWeight="700">{cl.name.split(" ")[0]}</text>
          </g>
        ))}
        {referrals.map(r=>{
          const sel=selectedId===r.id;const col=r.status==="accepted"?"#10B981":RISK_C[r.urgency]||"#F59E0B";
          return <g key={r.id} onClick={()=>onSelect(r)} style={{cursor:"pointer"}}>
            <circle cx={tx(r.lng)} cy={ty(r.lat)} r={sel?18:11} fill={col} opacity="0.14"/>
            <circle cx={tx(r.lng)} cy={ty(r.lat)} r={sel?9:6} fill={col} stroke="#fff" strokeWidth={sel?2:1}/>
            <text x={tx(r.lng)} y={ty(r.lat)+18} textAnchor="middle" fill={col} fontSize="6.5" fontWeight="700">{r.name.split(" ")[0]}</text>
          </g>;
        })}
      </svg>
    </div>
  );
};

// ─── PATIENT FILE DIRECTORY ───────────────────────────────────
const FileDirectory=({pt,onBack})=>{
  const T=useT();
  const [activeCategory,setActiveCategory]=useState("All");
  const categories=["All",...new Set(pt.files.map(f=>f.category))];
  const filtered=activeCategory==="All"?pt.files:pt.files.filter(f=>f.category===activeCategory);
  const fileIcons={pdf:"📄",doc:"📝",img:"🖼️",default:"📎"};
  const catColors={Discharge:T.red,Evaluation:T.blue,Imaging:T.purple,Insurance:T.amber,HEP:T.teal,Surgical:T.red,"Care Plan":T.green,Specialist:T.purple,Orders:T.amber};
  return(
    <div>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:T.blue,fontSize:13,fontWeight:600,marginBottom:16,padding:0}}>
        <Ico n="back" s={15} c={T.blue}/>Back to Profile
      </button>
      <div style={{display:"flex",gap:11,alignItems:"center",marginBottom:18}}>
        <div style={{width:44,height:44,borderRadius:13,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          <Ico n="folder" s={20} c="#fff"/>
        </div>
        <div>
          <div style={{color:T.text,fontWeight:800,fontSize:17}}>{pt.name}</div>
          <div style={{color:T.textMid,fontSize:12}}>Patient Files · {pt.files.length} documents</div>
        </div>
      </div>

      {/* Upload button */}
      <div style={{background:T.tealDim,border:`1px dashed ${T.teal}`,borderRadius:12,padding:"14px",textAlign:"center",marginBottom:14,cursor:"pointer"}}>
        <Ico n="upload" s={20} c={T.teal}/>
        <div style={{color:T.teal,fontSize:12,fontWeight:700,marginTop:6}}>Upload Document</div>
        <div style={{color:T.textDim,fontSize:10,marginTop:2}}>PDF, DOC, JPG — tap to add file</div>
      </div>

      {/* Category filter */}
      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:13,paddingBottom:4}}>
        {categories.map(cat=>(
          <button key={cat} onClick={()=>setActiveCategory(cat)} style={{flexShrink:0,background:activeCategory===cat?T.blueDim:T.surface,border:`1px solid ${activeCategory===cat?T.blue:T.border}`,borderRadius:9,padding:"6px 12px",color:activeCategory===cat?T.blue:T.textMid,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>{cat}</button>
        ))}
      </div>

      {/* File list */}
      {filtered.map(f=>{
        const col=catColors[f.category]||T.blue;
        return(
          <Card key={f.id} style={{padding:"12px 14px",borderLeft:`3px solid ${col}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:11,alignItems:"center",flex:1}}>
                <div style={{fontSize:24,flexShrink:0}}>📄</div>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontWeight:700,fontSize:13}}>{f.name}</div>
                  <div style={{color:T.textMid,fontSize:11,marginTop:2}}>{f.date} · {f.size}</div>
                  <Tag label={f.category} color={col} bg={`${col}18`}/>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:8}}>
                <button style={{background:T.blueDim,border:"none",borderRadius:8,padding:"7px 8px",cursor:"pointer"}}><Ico n="eye" s={14} c={T.blue}/></button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── PATIENT PROFILE ──────────────────────────────────────────
const PatientProfile=({pt,onBack,backLabel="Back",onToggleHEP,showFiles=false})=>{
  const T=useT();
  const[tab,setTab]=useState("info");
  const[region,setRegion]=useState("all");
  const[search,setSearch]=useState("");
  const[showHepBrowser,setShowHepBrowser]=useState(false);
  const[viewFiles,setViewFiles]=useState(showFiles);
  const agColor=AC[pt.agencyId]||{primary:T.blue};
  const ptEx=ALL_EX.filter(e=>pt.hep?.includes(e.id));
  const filteredEx=useMemo(()=>{
    let list=region==="all"?ALL_EX:ALL_EX.filter(e=>e.r===region);
    if(search.trim())list=list.filter(e=>e.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  },[region,search]);

  if(viewFiles) return <FileDirectory pt={pt} onBack={()=>setViewFiles(false)}/>;

  return(
    <div>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:T.blue,fontSize:13,fontWeight:600,marginBottom:14,padding:0}}>
        <Ico n="back" s={15} c={T.blue}/>{backLabel}
      </button>
      <div style={{background:T.surface,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${agColor.primary}55`}}>
        <div style={{display:"flex",gap:13,alignItems:"flex-start"}}>
          <div style={{width:50,height:50,borderRadius:15,background:`linear-gradient(135deg,${agColor.primary},${agColor.primary}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👤</div>
          <div style={{flex:1}}>
            <div style={{color:T.text,fontWeight:800,fontSize:17}}>{pt.name}</div>
            <div style={{color:T.textMid,fontSize:12,marginTop:1}}>{pt.cond}</div>
            <div style={{color:T.textMid,fontSize:11,marginTop:1}}>DOB: {pt.dob} · Age {pt.age}</div>
            <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
              <Tag label={`Risk: ${pt.risk}`} color={RISK_C[pt.risk]} bg={RISK_BG[pt.risk]}/>
              <Tag label={`${pt.adh}% adherent`} color={pt.adh>=70?T.green:T.amber} bg={pt.adh>=70?T.greenDim:T.amberDim}/>
              {pt.scheduleFreq&&<Tag label={pt.scheduleFreq} color={T.purple} bg={T.purpleDim}/>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:7,marginTop:13}}>
          <button onClick={()=>callPhone(pt.phone)} style={{flex:1,background:T.greenDim,border:`1px solid ${T.green}44`,borderRadius:10,padding:"10px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",fontFamily:T.font}}>
            <Ico n="phone" s={13} c={T.green}/><span style={{color:T.green,fontSize:11,fontWeight:700}}>Call</span>
          </button>
          <button onClick={()=>openNav(pt.addr)} style={{flex:2,background:T.blueDim,border:`1px solid ${T.blue}44`,borderRadius:10,padding:"10px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",fontFamily:T.font}}>
            <Ico n="nav" s={13} c={T.blue}/><span style={{color:T.blue,fontSize:11,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pt.addr}</span>
          </button>
          <button onClick={()=>setViewFiles(true)} style={{flex:1,background:T.purpleDim,border:`1px solid ${T.purple}44`,borderRadius:10,padding:"10px",display:"flex",alignItems:"center",justifyContent:"center",gap:5,cursor:"pointer",fontFamily:T.font}}>
            <Ico n="folder" s={13} c={T.purple}/><span style={{color:T.purple,fontSize:11,fontWeight:700}}>Files</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
        {[{id:"info",l:"Clinical"},{id:"vitals",l:"Vitals"},{id:"hep",l:`HEP (${ptEx.length})`},{id:"schedule",l:"Schedule"},{id:"visits",l:"Visits"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,background:tab===t.id?T.blueDim:T.surface,border:`1px solid ${tab===t.id?T.blue:T.border}`,borderRadius:9,padding:"7px 12px",color:tab===t.id?T.blue:T.textMid,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>{t.l}</button>
        ))}
      </div>

      {tab==="info"&&(
        <>
          {[{icon:"phone",label:"Phone",val:pt.phone,action:()=>callPhone(pt.phone),actionLabel:"Call",ac:T.green},{icon:"pin",label:"Address",val:pt.addr,action:()=>openNav(pt.addr),actionLabel:"Navigate",ac:T.blue}].map(f=>(
            <Card key={f.label} style={{padding:"11px 13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1}}><div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{f.label}</div><div style={{color:T.text,fontSize:13,fontWeight:600}}>{f.val}</div></div>
                <button onClick={f.action} style={{background:`${f.ac}18`,border:`1px solid ${f.ac}44`,borderRadius:9,padding:"7px 12px",color:f.ac,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font,flexShrink:0,marginLeft:8}}>{f.actionLabel}</button>
              </div>
            </Card>
          ))}
          <Card style={{padding:"11px 13px",borderLeft:`3px solid ${T.red}`}}>
            <div style={{color:T.red,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Emergency Contact</div>
            <div style={{color:T.text,fontSize:13,fontWeight:600}}>{pt.emergency.name}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:3}}>
              <div style={{color:T.textMid,fontSize:12}}>{pt.emergency.phone}</div>
              <button onClick={()=>callPhone(pt.emergency.phone)} style={{background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:8,padding:"5px 10px",color:T.red,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Call</button>
            </div>
          </Card>
          <Card style={{padding:"11px 13px"}}><div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Insurance</div><div style={{color:T.text,fontSize:13}}>{pt.insurance}</div><div style={{color:T.textDim,fontSize:11,marginTop:2}}>ID: {pt.insuranceId}</div></Card>
          <Card style={{padding:"11px 13px"}}><div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Physician</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:T.text,fontSize:13,fontWeight:600}}>{pt.physician}</div><div style={{color:T.textMid,fontSize:11,marginTop:2}}>{pt.physicianPhone}</div></div><button onClick={()=>callPhone(pt.physicianPhone)} style={{background:T.purpleDim,border:`1px solid ${T.purple}44`,borderRadius:8,padding:"5px 10px",color:T.purple,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Call</button></div></Card>
          <Card style={{padding:"11px 13px",borderLeft:`3px solid ${T.amber}`}}><div style={{color:T.amber,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>⚠️ Precautions</div><div style={{color:T.text,fontSize:12,lineHeight:1.6}}>{pt.precautions}</div></Card>
          <Card style={{padding:"11px 13px",borderLeft:`3px solid ${T.red}`}}><div style={{color:T.red,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Allergies</div><div style={{color:T.text,fontSize:12}}>{pt.allergies}</div></Card>
          <Card style={{padding:"11px 13px"}}><div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Clinical Notes</div><div style={{color:T.textMid,fontSize:12,lineHeight:1.6}}>{pt.notes}</div></Card>
        </>
      )}

      {tab==="vitals"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          {[{label:"Blood Pressure",val:pt.vitals.bp,color:T.blue,icon:"❤️"},{label:"Heart Rate",val:pt.vitals.hr,color:T.red,icon:"💓"},{label:"O₂ Saturation",val:pt.vitals.o2,color:T.teal,icon:"🫁"},{label:"Weight",val:pt.vitals.weight,color:T.amber,icon:"⚖️"}].map(v=>(
            <Card key={v.label} style={{marginBottom:0,padding:"13px",borderLeft:`3px solid ${v.color}`}}>
              <div style={{fontSize:16,marginBottom:4}}>{v.icon}</div>
              <div style={{color:v.color,fontWeight:800,fontSize:18}}>{v.val}</div>
              <div style={{color:T.textMid,fontSize:10,marginTop:2}}>{v.label}</div>
            </Card>
          ))}
        </div>
      )}

      {tab==="hep"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
            <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px"}}>{ptEx.length} exercises assigned</div>
            {onToggleHEP&&<button onClick={()=>setShowHepBrowser(v=>!v)} style={{background:showHepBrowser?T.redDim:T.tealDim,border:`1px solid ${showHepBrowser?T.red:T.teal}44`,borderRadius:9,padding:"7px 12px",color:showHepBrowser?T.red:T.teal,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>{showHepBrowser?"Close":"+ Add"}</button>}
          </div>
          {showHepBrowser&&onToggleHEP&&(
            <div style={{marginBottom:14}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises..." style={{width:"100%",boxSizing:"border-box",background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:13,outline:"none",marginBottom:9,fontFamily:T.font}}/>
              <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:9,paddingBottom:4}}>
                {REGIONS.map(rg=><button key={rg.id} onClick={()=>setRegion(rg.id)} style={{flexShrink:0,background:region===rg.id?(RC[rg.id]||T.blue):T.surface,border:`1px solid ${region===rg.id?(RC[rg.id]||T.blue):T.border}`,borderRadius:9,padding:"6px 10px",color:region===rg.id?"#fff":T.textMid,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>{rg.emoji} {rg.label}</button>)}
              </div>
              <div style={{background:T.purpleDim,borderRadius:10,padding:11,marginBottom:9,border:`1px solid ${T.purple}33`}}>
                <div style={{color:T.purple,fontWeight:700,fontSize:11,marginBottom:6}}>🩺 Apply Diagnosis Template</div>
                <select onChange={e=>{if(e.target.value){const dx=DX_TEMPLATES.find(d=>d.id===e.target.value);if(dx)dx.exs.forEach(eid=>{if(!pt.hep?.includes(eid))onToggleHEP(eid);});}}} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.text,fontSize:12,outline:"none",fontFamily:T.font}}>
                  <option value="">Select diagnosis template…</option>
                  {DX_TEMPLATES.map(dx=><option key={dx.id} value={dx.id}>{dx.icon} {dx.name}</option>)}
                </select>
              </div>
              {filteredEx.map(ex=>{
                const added=pt.hep?.includes(ex.id);
                return <ExerciseCard key={ex.id} ex={ex} compact={true} added={added} onAdd={onToggleHEP}/>;
              })}
              <button onClick={()=>setShowHepBrowser(false)} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:12,color:T.textMid,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:4,fontFamily:T.font}}>Done</button>
            </div>
          )}
          {ptEx.map(ex=><ExerciseCard key={ex.id} ex={ex} compact={false} onRemove={onToggleHEP?()=>onToggleHEP(ex.id):null}/>)}
        </>
      )}

      {tab==="schedule"&&(
        <>
          <Card style={{borderLeft:`3px solid ${T.purple}`,marginBottom:11}}>
            <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Visit Frequency</div>
            <div style={{color:T.purple,fontSize:22,fontWeight:900,letterSpacing:-0.5}}>{pt.scheduleFreq||"Not set"}</div>
            {pt.scheduleFreq&&<div style={{color:T.textMid,fontSize:12,marginTop:4}}>
              {pt.scheduleFreq.includes("w")&&`${pt.scheduleFreq.split("w")[0]}× per week for ${pt.scheduleFreq.split("w")[1]} weeks`}
            </div>}
            {pt.scheduleDays&&<div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>{pt.scheduleDays.map(d=><Tag key={d} label={d} color={T.purple} bg={T.purpleDim}/>)}</div>}
          </Card>
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:9}}>Upcoming Visits</div>
          {INIT_VISITS.filter(v=>v.patientId===pt.id&&v.status==="scheduled").map(v=>{
            const vt=VT.find(t=>t.id===v.type);
            return <Card key={v.id} style={{padding:"11px 13px",borderLeft:`3px solid ${vt?.color||T.blue}`}}><div style={{color:T.text,fontWeight:700,fontSize:13}}>{vt?.code||v.type}</div><div style={{color:T.textMid,fontSize:12,marginTop:3}}>📅 {v.date}</div></Card>;
          })}
        </>
      )}

      {tab==="visits"&&pt.visits?.map((v,i)=>{const vt=VT.find(t=>t.id===v.type);return <Card key={i} style={{padding:"10px 13px",borderLeft:`3px solid ${vt?.color||T.border}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:T.text,fontWeight:600,fontSize:13}}>{vt?.label||v.type}</div><div style={{color:T.textMid,fontSize:11,marginTop:2}}>📅 {v.date}</div></div><Tag label={v.status} color={ST_C[v.status]||T.textMid} bg={`${ST_C[v.status]||T.textMid}18`}/></div></Card>;})}
    </div>
  );
};

// ─── WEEKLY CALENDAR (drag-and-drop style) ────────────────────
const WeeklyCalendar=({visits,patients,clinicianId,onVisitMove,onAddVisit})=>{
  const T=useT();
  // Use a ref to reliably hold the dragged visit across async drag events
  const dragRef=useRef(null);
  const[dragOver,setDragOver]=useState(null);
  const[isDragging,setIsDragging]=useState(false);
  const[localVisits,setLocalVisits]=useState(visits);

  // Keep localVisits in sync with prop
  useRef(()=>{setLocalVisits(visits);},[visits]);

  const weekStart=new Date(TODAY);
  const dayOfWeek=weekStart.getDay();
  const monday=new Date(weekStart);
  monday.setDate(weekStart.getDate()-(dayOfWeek===0?6:dayOfWeek-1));
  const weekDays=Array.from({length:7},(_,i)=>{
    const d=new Date(monday);d.setDate(monday.getDate()+i);
    return{date:d.toISOString().split("T")[0],day:DAYS_SHORT[d.getDay()],num:d.getDate(),isToday:d.toISOString().split("T")[0]===TODAY.toISOString().split("T")[0]};
  });

  const myVisits=localVisits.filter(v=>v.clinicianId===clinicianId);
  const getVisitsForCell=(date,hIdx)=>myVisits.filter(v=>v.date===date&&(v.hour||8)===8+hIdx);

  const handleDrop=(e,date,hIdx)=>{
    e.preventDefault();
    e.stopPropagation();
    const v=dragRef.current;
    if(!v)return;
    // Optimistically update local state so UI responds immediately
    setLocalVisits(prev=>prev.map(x=>x.id===v.id?{...x,date,hour:8+hIdx}:x));
    if(onVisitMove)onVisitMove(v,date,8+hIdx);
    dragRef.current=null;
    setDragOver(null);
    setIsDragging(false);
  };

  return(
    <div style={{overflow:"hidden",userSelect:"none"}}>
      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:`48px repeat(7,1fr)`,gap:0,marginBottom:4}}>
        <div/>
        {weekDays.map(d=>(
          <div key={d.date} style={{textAlign:"center",padding:"7px 2px",background:d.isToday?`linear-gradient(135deg,${T.teal},${T.blue})`:T.surfaceUp,borderRadius:d.isToday?10:0,margin:"0 1px"}}>
            <div style={{color:d.isToday?"rgba(255,255,255,.8)":T.textMid,fontSize:9,fontWeight:600}}>{d.day}</div>
            <div style={{color:d.isToday?"#fff":T.text,fontWeight:800,fontSize:14}}>{d.num}</div>
          </div>
        ))}
      </div>

      {/* Time grid — not scrollable wrapper (that blocks dragover), scroll the outer shell instead */}
      <div style={{borderRadius:12,border:`1px solid ${T.border}`,background:T.surface,maxHeight:400,overflowY:"auto"}}>
        {HOURS.map((hour,hIdx)=>(
          <div key={hour} style={{display:"grid",gridTemplateColumns:`48px repeat(7,1fr)`,minHeight:56,borderBottom:`1px solid ${T.border}`}}>
            <div style={{padding:"4px 5px",color:T.textDim,fontSize:9,fontWeight:500,borderRight:`1px solid ${T.border}`,flexShrink:0,paddingTop:6}}>{hour}</div>
            {weekDays.map(d=>{
              const cellKey=`${d.date}-${hIdx}`;
              const cellVisits=getVisitsForCell(d.date,hIdx);
              const isTarget=isDragging&&dragOver===cellKey;
              return(
                <div key={d.date}
                  onDragEnter={e=>{e.preventDefault();if(isDragging)setDragOver(cellKey);}}
                  onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";if(isDragging)setDragOver(cellKey);}}
                  onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setDragOver(null);}}
                  onDrop={e=>handleDrop(e,d.date,hIdx)}
                  onClick={()=>{if(!cellVisits.length&&onAddVisit&&!isDragging)onAddVisit(d.date,8+hIdx);}}
                  style={{borderRight:`1px solid ${T.border}`,padding:"2px",minHeight:56,
                    background:isTarget?`${T.teal}30`:d.isToday?`${T.teal}06`:"transparent",
                    cursor:"pointer",position:"relative",transition:"background .1s",
                    outline:isTarget?`2px dashed ${T.teal}`:"none",outlineOffset:"-2px"}}>
                  {cellVisits.map(v=>{
                    const pt=patients.find(p=>p.id===v.patientId);
                    const vt=VT.find(t=>t.id===v.type);
                    const agC=AC[v.agencyId]||{primary:T.blue};
                    return(
                      <div key={v.id}
                        draggable="true"
                        onDragStart={e=>{
                          e.dataTransfer.effectAllowed="move";
                          // Must set data for Firefox compatibility
                          e.dataTransfer.setData("text/plain",v.id);
                          dragRef.current=v;
                          setIsDragging(true);
                          // Small delay so drag image renders before we change state
                          setTimeout(()=>{},0);
                        }}
                        onDragEnd={()=>{setIsDragging(false);setDragOver(null);dragRef.current=null;}}
                        style={{background:agC.primary,borderRadius:6,padding:"3px 6px",marginBottom:2,
                          cursor:"grab",userSelect:"none",opacity:isDragging&&dragRef.current?.id===v.id?0.55:1,
                          boxShadow:"0 1px 4px rgba(0,0,0,.3)",transition:"opacity .15s"}}>
                        <div style={{color:"#fff",fontSize:9,fontWeight:700,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{pt?.name.split(" ")[0]}</div>
                        <div style={{color:"rgba(255,255,255,.75)",fontSize:7.5}}>{vt?.code}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:7,alignItems:"center"}}>
        {Object.entries(AC).filter(([id])=>CLINICIANS.find(c=>c.id===clinicianId)?.agencyIds.includes(id)).map(([id,ac])=>(
          <div key={id} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:ac.primary}}/><span style={{color:T.textDim,fontSize:9}}>{ac.name.split(" ")[0]}</span></div>
        ))}
        <span style={{color:T.textDim,fontSize:9}}>· Drag to reschedule · Tap empty to add</span>
      </div>
    </div>
  );
};

// ─── MONTHLY CALENDAR ─────────────────────────────────────────
const MonthlyCalendar=({visits,patients,clinicianId})=>{
  const T=useT();
  const[month,setMonth]=useState(4); // May = index 4
  const[year,setYear]=useState(2026);
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=Array.from({length:firstDay},(_, )=>null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  const myVisits=visits.filter(v=>v.clinicianId===clinicianId);
  const getVisitsForDate=(day)=>{
    const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return myVisits.filter(v=>v.date===dateStr);
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 12px",color:T.text,cursor:"pointer",fontSize:16,fontFamily:T.font}}>‹</button>
        <div style={{color:T.text,fontWeight:700,fontSize:15}}>{MONTHS[month]} {year}</div>
        <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 12px",color:T.text,cursor:"pointer",fontSize:16,fontFamily:T.font}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:1}}>
        {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",color:T.textDim,fontSize:10,fontWeight:700,padding:"5px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>;
          const dayVisits=getVisitsForDate(day);
          const isToday=day===19&&month===4&&year===2026;
          return(
            <div key={i} style={{background:isToday?`linear-gradient(135deg,${T.teal},${T.blue})`:T.surface,borderRadius:9,padding:"6px 4px",minHeight:52,border:`1px solid ${T.border}`,position:"relative"}}>
              <div style={{color:isToday?"#fff":T.textMid,fontSize:11,fontWeight:isToday?800:500,marginBottom:3,textAlign:"center"}}>{day}</div>
              {dayVisits.slice(0,2).map(v=>{
                const pt=patients.find(p=>p.id===v.patientId);
                const agC=AC[v.agencyId]||{primary:T.blue};
                return <div key={v.id} style={{background:agC.primary,borderRadius:3,padding:"1px 4px",marginBottom:1}}><div style={{color:"#fff",fontSize:7,fontWeight:700,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{pt?.name.split(" ")[0]}</div></div>;
              })}
              {dayVisits.length>2&&<div style={{color:T.textDim,fontSize:8,textAlign:"center"}}>+{dayVisits.length-2}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── DAILY VIEW ───────────────────────────────────────────────
const DailyView=({visits,patients,clinicianId})=>{
  const T=useT();
  const myVisits=visits.filter(v=>v.clinicianId===clinicianId&&v.date===TODAY.toISOString().split("T")[0]);
  return(
    <div>
      <div style={{color:T.text,fontWeight:700,fontSize:15,marginBottom:14}}>Today — May 19, 2026</div>
      {HOURS.map((hour,hIdx)=>{
        const hVisits=myVisits.filter(v=>(v.hour||8)===8+hIdx);
        return(
          <div key={hour} style={{display:"flex",gap:11,marginBottom:1}}>
            <div style={{width:48,flexShrink:0,color:T.textDim,fontSize:11,paddingTop:4,textAlign:"right"}}>{hour}</div>
            <div style={{flex:1,borderLeft:`2px solid ${T.border}`,paddingLeft:10,minHeight:44}}>
              {hVisits.map(v=>{
                const pt=patients.find(p=>p.id===v.patientId);
                const vt=VT.find(t=>t.id===v.type);
                const agC=AC[v.agencyId]||{primary:T.blue};
                return(
                  <div key={v.id} style={{background:agC.light,border:`1px solid ${agC.primary}`,borderLeft:`3px solid ${agC.primary}`,borderRadius:9,padding:"8px 12px",marginBottom:4}}>
                    <div style={{color:T.text,fontWeight:700,fontSize:13}}>{pt?.name}</div>
                    <div style={{display:"flex",gap:7,alignItems:"center",marginTop:3}}>
                      <Tag label={vt?.code||v.type} color={vt?.color||T.blue} bg={`${vt?.color||T.blue}22`}/>
                      <button onClick={()=>pt&&openNav(pt.addr)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:T.blue,fontSize:11,fontWeight:600,fontFamily:T.font}}>
                        <Ico n="nav" s={11} c={T.blue}/>Navigate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── SCHEDULE MODAL (frequency + duration picker) ─────────────
const ScheduleModal=({patient,patients,onSave,onClose})=>{
  const T=useT();
  const[freq,setFreq]=useState(2);
  const[weeks,setWeeks]=useState(4);
  const[days,setDays]=useState(["Mon","Thu"]);
  const[startDate,setStartDate]=useState(TODAY.toISOString().split("T")[0]);
  const[visitType,setVisitType]=useState("followup");
  const[agency,setAgency]=useState("ag1");

  const toggleDay=d=>setDays(prev=>prev.includes(d)?prev.filter(x=>x!==d):[...prev,d].slice(0,freq));
  const code=`${freq}w${weeks}`;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:T.surface,borderRadius:"20px 20px 0 0",padding:"24px 20px",width:"100%",maxWidth:430,maxHeight:"85vh",overflowY:"auto",border:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{color:T.text,fontWeight:800,fontSize:17}}>Schedule Visit Frequency</div>
          <button onClick={onClose} style={{background:T.surfaceUp,border:"none",borderRadius:8,padding:"6px 10px",color:T.textMid,cursor:"pointer",fontSize:14}}>✕</button>
        </div>

        {/* Patient */}
        <div style={{marginBottom:13}}>
          <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Patient</div>
          <select style={{width:"100%",background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}>
            {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Visit type */}
        <div style={{marginBottom:13}}>
          <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Visit Type</div>
          <select value={visitType} onChange={e=>setVisitType(e.target.value)} style={{width:"100%",background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}>
            {VT.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>

        {/* Frequency code display */}
        <div style={{background:T.purpleDim,borderRadius:12,padding:"14px 16px",marginBottom:16,border:`1px solid ${T.purple}33`,textAlign:"center"}}>
          <div style={{color:T.textMid,fontSize:11,marginBottom:4}}>Frequency Code</div>
          <div style={{color:T.purple,fontSize:34,fontWeight:900,letterSpacing:-1}}>{code}</div>
          <div style={{color:T.textMid,fontSize:12,marginTop:4}}>{freq}× per week for {weeks} weeks = {freq*weeks} total visits</div>
        </div>

        {/* Times per week */}
        <div style={{marginBottom:14}}>
          <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Times Per Week</div>
          <div style={{display:"flex",gap:8}}>
            {[1,2,3,4,5].map(n=><button key={n} onClick={()=>{setFreq(n);setDays(d=>d.slice(0,n));}} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${freq===n?T.purple:T.border}`,background:freq===n?T.purpleDim:T.surface,color:freq===n?T.purple:T.textMid,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.font}}>{n}</button>)}
          </div>
        </div>

        {/* Duration in weeks */}
        <div style={{marginBottom:14}}>
          <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Duration (weeks)</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {[1,2,3,4,6,8,10,12].map(n=><button key={n} onClick={()=>setWeeks(n)} style={{padding:"8px 13px",borderRadius:9,border:`1px solid ${weeks===n?T.blue:T.border}`,background:weeks===n?T.blueDim:T.surface,color:weeks===n?T.blue:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:T.font}}>{n}w</button>)}
          </div>
        </div>

        {/* Day selector */}
        <div style={{marginBottom:14}}>
          <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Visit Days (pick {freq})</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>{
              const sel=days.includes(d);const tooMany=!sel&&days.length>=freq;
              return <button key={d} onClick={()=>!tooMany&&toggleDay(d)} style={{padding:"8px 13px",borderRadius:9,border:`1px solid ${sel?T.teal:T.border}`,background:sel?T.tealDim:tooMany?T.surfaceUp:T.surface,color:sel?T.teal:tooMany?T.textDim:T.textMid,fontWeight:700,fontSize:12,cursor:tooMany?"not-allowed":"pointer",fontFamily:T.font}}>{d}</button>;
            })}
          </div>
        </div>

        {/* Start date */}
        <div style={{marginBottom:20}}>
          <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Start Date</div>
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{width:"100%",boxSizing:"border-box",background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}/>
        </div>

        <button onClick={()=>{onSave&&onSave({freq,weeks,days,startDate,visitType,code});onClose();}} style={{width:"100%",background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:13,padding:15,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:T.font}}>
          Schedule {freq*weeks} Visits ({code})
        </button>
      </div>
    </div>
  );
};

// ─── AI FAX SCANNER ───────────────────────────────────────────
const FaxScanner=({onReferralExtracted,onClose})=>{
  const T=useT();
  const[step,setStep]=useState("capture"); // capture | processing | review
  const[extractedData,setExtractedData]=useState(null);
  const fileRef=useRef();

  const simulateAIExtraction=()=>{
    setStep("processing");
    setTimeout(()=>{
      setExtractedData({
        name:"Eleanor Hoffman",age:"77",
        dx:"Left hip fracture post-ORIF. Pt requires gait training, ADL retraining, home safety evaluation. Fall risk HIGH.",
        insurance:"Medicare Part A",addr:"2245 Brickell Ave, Miami, FL 33129",
        urgency:"high",sentBy:"Mercy Hospital",
      });
      setStep("review");
    },2200);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:T.surface,borderRadius:"20px 20px 0 0",padding:"24px 20px",width:"100%",maxWidth:430,maxHeight:"85vh",overflowY:"auto",border:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <div style={{color:T.text,fontWeight:800,fontSize:17}}>📠 Fax Referral Scanner</div>
            <div style={{color:T.textMid,fontSize:11,marginTop:2}}>AI extracts referral details automatically</div>
          </div>
          <button onClick={onClose} style={{background:T.surfaceUp,border:"none",borderRadius:8,padding:"6px 10px",color:T.textMid,cursor:"pointer",fontSize:14}}>✕</button>
        </div>

        {step==="capture"&&(
          <>
            <div onClick={()=>fileRef.current?.click()} style={{background:T.tealDim,border:`2px dashed ${T.teal}`,borderRadius:16,padding:"40px 20px",textAlign:"center",cursor:"pointer",marginBottom:16}}>
              <div style={{fontSize:40,marginBottom:10}}>📷</div>
              <div style={{color:T.teal,fontWeight:700,fontSize:15,marginBottom:4}}>Take Photo of Fax</div>
              <div style={{color:T.textMid,fontSize:12}}>Point camera at the referral fax paper<br/>AI will read and fill in all details</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={simulateAIExtraction}/>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
              <div style={{flex:1,height:1,background:T.border}}/>
              <div style={{color:T.textDim,fontSize:11}}>or</div>
              <div style={{flex:1,height:1,background:T.border}}/>
            </div>
            <button onClick={simulateAIExtraction} style={{width:"100%",background:T.blueDim,border:`1px solid ${T.blue}`,borderRadius:12,padding:13,color:T.blue,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
              Demo: Auto-fill from Sample Fax
            </button>
          </>
        )}

        {step==="processing"&&(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:40,marginBottom:16,animation:"spin 1s linear infinite"}}>⚙️</div>
            <div style={{color:T.text,fontWeight:700,fontSize:16,marginBottom:8}}>Reading Fax...</div>
            <div style={{color:T.textMid,fontSize:13}}>AI is extracting patient information,<br/>diagnosis, insurance, and address</div>
            <div style={{marginTop:20,background:T.surfaceUp,borderRadius:10,overflow:"hidden",height:6}}>
              <div style={{height:"100%",background:`linear-gradient(90deg,${T.teal},${T.blue})`,width:"70%",animation:"progress 2s ease-in-out",borderRadius:10}}/>
            </div>
          </div>
        )}

        {step==="review"&&extractedData&&(
          <>
            <div style={{background:T.greenDim,border:`1px solid ${T.green}44`,borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:18}}>✅</span>
              <div><div style={{color:T.green,fontWeight:700,fontSize:13}}>AI Extraction Complete</div><div style={{color:T.textMid,fontSize:11}}>Review and confirm before sending</div></div>
            </div>
            {[{k:"name",l:"Patient Name"},{k:"age",l:"Age"},{k:"addr",l:"Address"},{k:"insurance",l:"Insurance"},{k:"sentBy",l:"Referring Facility"}].map(f=>(
              <div key={f.k} style={{marginBottom:11}}>
                <div style={{color:T.textMid,fontSize:10,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.l}</div>
                <input value={extractedData[f.k]} onChange={e=>setExtractedData(d=>({...d,[f.k]:e.target.value}))} style={{width:"100%",boxSizing:"border-box",background:T.surfaceUp,border:`1px solid ${T.teal}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}/>
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <div style={{color:T.textMid,fontSize:10,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>Diagnosis Brief</div>
              <textarea value={extractedData.dx} onChange={e=>setExtractedData(d=>({...d,dx:e.target.value}))} rows={3} style={{width:"100%",boxSizing:"border-box",background:T.surfaceUp,border:`1px solid ${T.teal}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",resize:"none",fontFamily:T.font}}/>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{color:T.textMid,fontSize:10,fontWeight:600,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.5px"}}>Urgency</div>
              <div style={{display:"flex",gap:7}}>
                {["high","medium","low"].map(u=><button key={u} onClick={()=>setExtractedData(d=>({...d,urgency:u}))} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${extractedData.urgency===u?(RISK_C[u]||T.blue):T.border}`,background:extractedData.urgency===u?RISK_BG[u]:T.surface,color:extractedData.urgency===u?RISK_C[u]:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",textTransform:"capitalize",fontFamily:T.font}}>{u}</button>)}
              </div>
            </div>
            <button onClick={()=>{onReferralExtracted(extractedData);onClose();}} style={{width:"100%",background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:13,padding:15,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:T.font}}>
              Send Referral →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── LOGIN ─────────────────────────────────────────────────────
const Login=({onLogin})=>{
  const{dark,setDark}=useTheme();const T=dark?DARK_T:LIGHT_T;
  const[role,setRole]=useState("clinician");
  const roles=[{id:"superadmin",label:"Super Admin",emoji:"🏢"},{id:"admin",label:"Agency Admin",emoji:"🛡️"},{id:"staffing",label:"Staffing",emoji:"📋"},{id:"clinician",label:"Clinician",emoji:"👩‍⚕️"},{id:"patient",label:"Patient",emoji:"💙"}];
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:22,fontFamily:T.font}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
          <button onClick={()=>setDark(d=>!d)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:16}}>{dark?"☀️":"🌙"}</button>
        </div>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{width:68,height:68,background:`linear-gradient(135deg,${T.teal},${T.blue})`,borderRadius:20,margin:"0 auto 13px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 0 40px ${T.tealDim}`}}>⚕️</div>
          <div style={{color:T.text,fontSize:24,fontWeight:900,letterSpacing:-1}}>HomeHealth Connect</div>
          <div style={{color:T.textMid,fontSize:12,marginTop:4}}>HIPAA-Compliant Home Health Platform</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:18}}>
          {roles.map(r=>(
            <button key={r.id} onClick={()=>setRole(r.id)} style={{padding:"11px 8px",borderRadius:12,border:`1px solid ${role===r.id?T.teal:T.border}`,cursor:"pointer",background:role===r.id?T.tealDim:T.surface,color:role===r.id?T.teal:T.textMid,fontWeight:700,fontSize:11,fontFamily:T.font,gridColumn:r.id==="patient"?"1/-1":"auto"}}>
              <div style={{fontSize:17,marginBottom:3}}>{r.emoji}</div>{r.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <input placeholder="Email address" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 15px",color:T.text,fontSize:14,outline:"none",fontFamily:T.font}}/>
          <input type="password" placeholder="Password" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 15px",color:T.text,fontSize:14,outline:"none",fontFamily:T.font}}/>
          <button onClick={()=>onLogin(role)} style={{background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:12,padding:15,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:T.font}}>Sign In →</button>
        </div>
        <div style={{textAlign:"center",marginTop:18,color:T.textDim,fontSize:10,letterSpacing:"0.6px"}}>🔒 HIPAA · BAA AVAILABLE · SOC 2 TYPE II</div>
      </div>
    </div>
  );
};

// ─── CLINICIAN APP ─────────────────────────────────────────────
const ClinicianApp=({onLogout})=>{
  const T=useT();
  const cl=CLINICIANS[0];
  const[tab,setTab]=useState("home");
  const[patients,setPatients]=useState(PATIENTS_DB);
  const[visits,setVisits]=useState(INIT_VISITS);
  const[referrals,setReferrals]=useState(INIT_REFERRALS.filter(r=>r.status==="open"));
  const[selPt,setSelPt]=useState(null);
  const[calView,setCalView]=useState("week"); // month|week|day
  const[showScheduleModal,setShowScheduleModal]=useState(false);
  const[filterAgency,setFilterAgency]=useState("all");

  const myPatients=patients.filter(p=>cl.agencyIds.includes(p.agencyId)&&p.clinicianId===cl.id);
  const myAgencies=AGENCIES.filter(a=>cl.agencyIds.includes(a.id));

  const toggleHEP=useCallback((ptId,exId)=>setPatients(ps=>ps.map(p=>p.id===ptId?{...p,hep:p.hep.includes(exId)?p.hep.filter(x=>x!==exId):[...p.hep,exId]}:p)),[]);
  const acceptReferral=rId=>setReferrals(rs=>rs.filter(r=>r.id!==rId));
  const moveVisit=(v,newDate,newHour)=>setVisits(vs=>vs.map(x=>x.id===v.id?{...x,date:newDate,hour:newHour}:x));

  const tabs=[
    {id:"home",label:"Home",icon:"home"},
    {id:"schedule",label:"Schedule",icon:"cal"},
    {id:"patients",label:"Patients",icon:"users"},
    {id:"referrals",label:"Referrals",icon:"ref"},
    {id:"pay",label:"Pay",icon:"inv"},
  ];

  if(selPt){
    const pt=patients.find(p=>p.id===selPt);
    if(!pt)return null;
    return <Shell tabs={tabs} active={tab} setTab={t=>{setTab(t);setSelPt(null);}} onLogout={onLogout} title={cl.name} subtitle="Clinician Portal" accent={T.teal}>
      <PatientProfile pt={pt} onBack={()=>setSelPt(null)} backLabel="Patients" onToggleHEP={exId=>toggleHEP(selPt,exId)}/>
    </Shell>;
  }

  return(
    <Shell tabs={tabs} active={tab} setTab={setTab} onLogout={onLogout} title={cl.name} subtitle={`${cl.role} · ${myAgencies.map(a=>a.name.split(" ")[0]).join(", ")}`} accent={T.teal}>
      {showScheduleModal&&<ScheduleModal patients={myPatients} onSave={data=>console.log("Scheduled:",data)} onClose={()=>setShowScheduleModal(false)}/>}

      {/* Agency filter */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
        <button onClick={()=>setFilterAgency("all")} style={{flexShrink:0,background:filterAgency==="all"?T.tealDim:T.surface,border:`1px solid ${filterAgency==="all"?T.teal:T.border}`,borderRadius:9,padding:"6px 12px",color:filterAgency==="all"?T.teal:T.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>All</button>
        {myAgencies.map(ag=>{const ac=AC[ag.id]||{primary:T.blue};return <button key={ag.id} onClick={()=>setFilterAgency(ag.id)} style={{flexShrink:0,background:filterAgency===ag.id?ac.light:T.surface,border:`1px solid ${filterAgency===ag.id?ac.primary:T.border}`,borderRadius:9,padding:"6px 12px",color:filterAgency===ag.id?ac.primary:T.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:5}}><span>{ag.logo}</span>{ag.name.split(" ")[0]}</button>;})}
      </div>

      {tab==="home"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            <Stat label="Patients" value={myPatients.filter(p=>filterAgency==="all"||p.agencyId===filterAgency).length} color={T.teal}/>
            <Stat label="Open Referrals" value={referrals.length} color={T.amber}/>
            <Stat label="At-Risk" value={myPatients.filter(p=>p.risk==="high"&&(filterAgency==="all"||p.agencyId===filterAgency)).length} color={T.red}/>
            <Stat label="Agencies" value={myAgencies.length} color={T.purple}/>
          </div>
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:9}}>⚠️ Risk Alerts</div>
          {myPatients.filter(p=>(p.risk==="high"||p.adh<60)&&(filterAgency==="all"||p.agencyId===filterAgency)).map(p=>{
            const ac=AC[p.agencyId]||{primary:T.blue};
            return <Card key={p.id} style={{borderLeft:`3px solid ${T.red}`,padding:"11px 13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{color:T.text,fontWeight:700,fontSize:13}}>{p.name}</span><div style={{width:6,height:6,borderRadius:"50%",background:ac.primary}}/></div><div style={{color:T.red,fontSize:11,marginTop:2}}>Adherence {p.adh}% — intervention needed</div></div>
                <button onClick={()=>setSelPt(p.id)} style={{background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:8,padding:"7px 11px",color:T.red,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>View</button>
              </div>
            </Card>;
          })}
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",margin:"14px 0 9px"}}>New Referrals</div>
          {referrals.slice(0,2).map(r=>(
            <Card key={r.id} style={{borderLeft:`3px solid ${RISK_C[r.urgency]||T.amber}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div><div style={{color:T.text,fontWeight:700,fontSize:13}}>{r.name}, {r.age}</div><div style={{color:T.textMid,fontSize:11,marginTop:2,lineHeight:1.5}}>{r.dx.slice(0,80)}…</div></div>
                <Tag label={r.urgency} color={RISK_C[r.urgency]||T.amber} bg={RISK_BG[r.urgency]||T.amberDim}/>
              </div>
              <button onClick={()=>openNav(r.addr)} style={{display:"flex",alignItems:"center",gap:6,background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:9,padding:"7px 12px",cursor:"pointer",marginBottom:9,fontFamily:T.font}}>
                <Ico n="nav" s={12} c={T.blue}/><span style={{color:T.blue,fontSize:11,fontWeight:600}}>{r.addr}</span>
              </button>
              <div style={{display:"flex",gap:7}}>
                <button style={{flex:1,background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px",color:T.textMid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>Decline</button>
                <button onClick={()=>acceptReferral(r.id)} style={{flex:2,background:`linear-gradient(135deg,${T.green},${T.teal})`,border:"none",borderRadius:9,padding:"9px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:T.font}}>✓ Accept</button>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab==="schedule"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{color:T.text,fontWeight:800,fontSize:18}}>Schedule</div>
            <button onClick={()=>setShowScheduleModal(true)} style={{background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:10,padding:"8px 13px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:T.font}}>
              <Ico n="plus" s={12} c="#fff"/>Schedule
            </button>
          </div>

          {/* Agency legend */}
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {myAgencies.map(ag=>{const ac=AC[ag.id]||{primary:T.blue};return <div key={ag.id} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:3,background:ac.primary}}/><span style={{color:T.textMid,fontSize:11}}>{ag.logo} {ag.name.split(" ")[0]}</span></div>;})}
            <div style={{color:T.textDim,fontSize:10,alignSelf:"center"}}>· Drag to reschedule</div>
          </div>

          {/* View toggle */}
          <div style={{display:"flex",gap:7,marginBottom:14}}>
            {["month","week","day"].map(v=>(
              <button key={v} onClick={()=>setCalView(v)} style={{flex:1,background:calView===v?T.blueDim:T.surface,border:`1px solid ${calView===v?T.blue:T.border}`,borderRadius:10,padding:"9px",color:calView===v?T.blue:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",textTransform:"capitalize",fontFamily:T.font}}>{v}</button>
            ))}
          </div>

          {calView==="month"&&<MonthlyCalendar visits={visits} patients={patients} clinicianId={cl.id}/>}
          {calView==="week"&&<WeeklyCalendar visits={visits} patients={patients} clinicianId={cl.id} onVisitMove={moveVisit} onAddVisit={(date,hour)=>console.log("Add visit:",date,hour)}/>}
          {calView==="day"&&<DailyView visits={visits} patients={patients} clinicianId={cl.id}/>}
        </>
      )}

      {tab==="patients"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:18,marginBottom:12}}>My Patients</div>
          {myPatients.filter(p=>filterAgency==="all"||p.agencyId===filterAgency).map(p=>{
            const ac=AC[p.agencyId]||{primary:T.blue};
            return <Card key={p.id} onClick={()=>setSelPt(p.id)} style={{borderLeft:`3px solid ${ac.primary}`}}>
              <div style={{display:"flex",gap:11,alignItems:"center"}}>
                <div style={{background:T.surfaceUp,borderRadius:10,padding:"8px 11px",textAlign:"center",flexShrink:0}}>
                  <div style={{color:p.adh>=70?T.green:p.adh>=50?T.amber:T.red,fontWeight:900,fontSize:17}}>{p.adh}%</div>
                  <div style={{color:T.textDim,fontSize:9}}>ADH</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}><span style={{color:T.text,fontWeight:700,fontSize:14}}>{p.name}</span><span style={{fontSize:12}}>{AGENCIES.find(a=>a.id===p.agencyId)?.logo}</span></div>
                  <div style={{color:T.textMid,fontSize:11,marginBottom:4}}>{p.cond}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <Tag label={`Risk: ${p.risk}`} color={RISK_C[p.risk]} bg={RISK_BG[p.risk]}/>
                    {p.scheduleFreq&&<Tag label={p.scheduleFreq} color={T.purple} bg={T.purpleDim}/>}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <button onClick={e=>{e.stopPropagation();openNav(p.addr);}} style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:8,padding:"7px 8px",cursor:"pointer"}}><Ico n="nav" s={13} c={T.blue}/></button>
                  <button onClick={e=>{e.stopPropagation();callPhone(p.phone);}} style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:8,padding:"7px 8px",cursor:"pointer"}}><Ico n="phone" s={13} c={T.green}/></button>
                </div>
              </div>
            </Card>;
          })}
        </>
      )}

      {tab==="referrals"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:18,marginBottom:4}}>Referrals</div>
          <div style={{color:T.textMid,fontSize:12,marginBottom:12}}>Accept to add to caseload · Tap address to navigate</div>
          <MapView referrals={referrals} clinicians={[cl]} onSelect={()=>{}} selectedId={null}/>
          {referrals.map(r=>(
            <Card key={r.id} style={{borderLeft:`3px solid ${RISK_C[r.urgency]||T.amber}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div><div style={{color:T.text,fontWeight:700,fontSize:14}}>{r.name}, {r.age}</div><div style={{color:T.textMid,fontSize:11}}>{r.insurance}</div></div>
                <Tag label={r.urgency} color={RISK_C[r.urgency]||T.amber} bg={RISK_BG[r.urgency]||T.amberDim}/>
              </div>
              <div style={{color:T.textMid,fontSize:12,lineHeight:1.5,marginBottom:7}}>{r.dx}</div>
              <button onClick={()=>openNav(r.addr)} style={{display:"flex",alignItems:"center",gap:6,background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:9,padding:"7px 12px",cursor:"pointer",marginBottom:9,fontFamily:T.font}}>
                <Ico n="nav" s={13} c={T.blue}/><span style={{color:T.blue,fontSize:11,fontWeight:600}}>{r.addr}</span>
              </button>
              <div style={{display:"flex",gap:7}}>
                <button style={{flex:1,background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px",color:T.textMid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>Decline</button>
                <button onClick={()=>acceptReferral(r.id)} style={{flex:2,background:`linear-gradient(135deg,${T.green},${T.teal})`,border:"none",borderRadius:9,padding:"10px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:T.font}}>✓ Accept Patient</button>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab==="pay"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:18,marginBottom:4}}>Pay Statements</div>
          <div style={{color:T.textMid,fontSize:12,marginBottom:14}}>Per agency · Based on approved visits</div>
          {myAgencies.filter(a=>filterAgency==="all"||a.id===filterAgency).map(ag=>{
            const ac=AC[ag.id]||{primary:T.blue};
            const rates=cl.customRates[ag.id]||{};
            const agVisits=visits.filter(v=>v.clinicianId===cl.id&&v.agencyId===ag.id&&v.status!=="pending"&&v.status!=="scheduled");
            const total=agVisits.reduce((s,v)=>s+(rates[v.type]||0),0);
            return <div key={ag.id} style={{marginBottom:20}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:9}}>
                <span style={{fontSize:18}}>{ag.logo}</span>
                <div style={{color:ac.primary,fontWeight:700,fontSize:14}}>{ag.name}</div>
                <Tag label={ag.invoicePeriod==="monthly"?"Monthly":"Biweekly"} color={T.amber} bg={T.amberDim}/>
              </div>
              <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10,paddingBottom:2}}>
                {VT.map(vt=><div key={vt.id} style={{flexShrink:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 11px",textAlign:"center",minWidth:68}}><div style={{color:vt.color,fontSize:8,fontWeight:700}}>{vt.code}</div><div style={{color:T.text,fontWeight:800,fontSize:13,marginTop:2}}>{fmt$(rates[vt.id]||0)}</div></div>)}
              </div>
              <Card style={{borderLeft:`3px solid ${ac.primary}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{color:T.text,fontWeight:700}}>Current Period</div>
                  <div style={{color:T.green,fontWeight:900,fontSize:18}}>{fmt$(total)}</div>
                </div>
                {VT.filter(vt=>agVisits.filter(v=>v.type===vt.id).length>0).map(vt=>{
                  const cnt=agVisits.filter(v=>v.type===vt.id).length;
                  return <div key={vt.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:3,height:11,borderRadius:2,background:vt.color}}/><span style={{color:T.textMid,fontSize:11}}>{cnt}× {vt.code}</span></div>
                    <span style={{color:T.text,fontSize:11,fontWeight:600}}>{fmt$(cnt*(rates[vt.id]||0))}</span>
                  </div>;
                })}
              </Card>
            </div>;
          })}
        </>
      )}
    </Shell>
  );
};

// ─── STAFFING APP ──────────────────────────────────────────────
const StaffingApp=({onLogout})=>{
  const T=useT();
  const[tab,setTab]=useState("referrals");
  const[referrals,setReferrals]=useState(INIT_REFERRALS);
  const[mapSel,setMapSel]=useState(null);
  const[showForm,setShowForm]=useState(false);
  const[showFaxScanner,setShowFaxScanner]=useState(false);
  const[form,setForm]=useState({name:"",age:"",dx:"",insurance:"",addr:"",urgency:"medium"});

  const submit=()=>{
    if(!form.name.trim())return;
    setReferrals(r=>[{id:`r${Date.now()}`,...form,lat:25.775+(Math.random()-.5)*.03,lng:-80.195+(Math.random()-.5)*.05,sentBy:"You",sentAt:"Just now",status:"open",agencyId:"ag1"},...r]);
    setShowForm(false);setForm({name:"",age:"",dx:"",insurance:"",addr:"",urgency:"medium"});
  };
  const addFaxReferral=data=>{
    setReferrals(r=>[{id:`r${Date.now()}`,...data,lat:25.775+(Math.random()-.5)*.03,lng:-80.195+(Math.random()-.5)*.05,sentAt:"Just now",status:"open",agencyId:"ag1"},...r]);
  };

  const tabs=[{id:"referrals",label:"Referrals",icon:"ref"},{id:"map",label:"Map",icon:"map"},{id:"team",label:"Clinicians",icon:"users"}];
  return(
    <Shell tabs={tabs} active={tab} setTab={setTab} onLogout={onLogout} title="Staffing Coordinator" subtitle="Referral Management" accent={T.teal}>
      {showFaxScanner&&<FaxScanner onReferralExtracted={addFaxReferral} onClose={()=>setShowFaxScanner(false)}/>}

      {tab==="referrals"&&(
        <>
          {showForm?(
            <>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div style={{color:T.text,fontWeight:800,fontSize:17}}>New Referral</div><button onClick={()=>setShowForm(false)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 12px",color:T.textMid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>Cancel</button></div>
              {[{k:"name",l:"Patient Name"},{k:"age",l:"Age"},{k:"addr",l:"Address"},{k:"insurance",l:"Insurance"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}><div style={{color:T.textMid,fontSize:10,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.l}</div><input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",boxSizing:"border-box",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}/></div>
              ))}
              <div style={{marginBottom:10}}><div style={{color:T.textMid,fontSize:10,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>Diagnosis Brief</div><textarea value={form.dx} onChange={e=>setForm(p=>({...p,dx:e.target.value}))} rows={3} style={{width:"100%",boxSizing:"border-box",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 12px",color:T.text,fontSize:13,outline:"none",resize:"none",fontFamily:T.font}}/></div>
              <div style={{marginBottom:16}}><div style={{color:T.textMid,fontSize:10,fontWeight:600,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.5px"}}>Urgency</div><div style={{display:"flex",gap:7}}>{["high","medium","low"].map(u=><button key={u} onClick={()=>setForm(p=>({...p,urgency:u}))} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${form.urgency===u?(RISK_C[u]||T.blue):T.border}`,background:form.urgency===u?RISK_BG[u]:T.surface,color:form.urgency===u?RISK_C[u]:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",textTransform:"capitalize",fontFamily:T.font}}>{u}</button>)}</div></div>
              <button onClick={submit} style={{width:"100%",background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:12,padding:14,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:T.font}}>Send Referral →</button>
            </>
          ):(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div><div style={{color:T.text,fontWeight:800,fontSize:17}}>Patient Referrals</div><div style={{color:T.textMid,fontSize:12}}>{referrals.filter(r=>r.status==="open").length} open</div></div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>setShowFaxScanner(true)} style={{background:T.purpleDim,border:`1px solid ${T.purple}44`,borderRadius:10,padding:"9px 12px",color:T.purple,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:T.font}}>
                    <Ico n="camera" s={13} c={T.purple}/>Scan Fax
                  </button>
                  <button onClick={()=>setShowForm(true)} style={{background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:T.font}}>
                    <Ico n="plus" s={12} c="#fff"/>New
                  </button>
                </div>
              </div>

              {/* AI Fax banner */}
              <div onClick={()=>setShowFaxScanner(true)} style={{background:`linear-gradient(135deg,${T.purpleDim},${T.blueDim})`,border:`1px solid ${T.purple}44`,borderRadius:13,padding:"13px 15px",marginBottom:13,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
                <span style={{fontSize:24}}>📠</span>
                <div>
                  <div style={{color:T.purple,fontWeight:700,fontSize:13}}>AI Fax Scanner</div>
                  <div style={{color:T.textMid,fontSize:11,marginTop:2}}>Take a photo of a fax referral — AI fills in all details automatically</div>
                </div>
                <Ico n="ai" s={18} c={T.purple}/>
              </div>

              {referrals.map(r=>(
                <Card key={r.id} style={{borderLeft:`3px solid ${r.status==="accepted"?T.green:RISK_C[r.urgency]||T.amber}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div><div style={{color:T.text,fontWeight:700,fontSize:14}}>{r.name}{r.age?`, ${r.age}`:""}</div><div style={{color:T.textMid,fontSize:11}}>{r.insurance}</div></div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><Tag label={r.urgency} color={RISK_C[r.urgency]||T.amber} bg={RISK_BG[r.urgency]||T.amberDim}/><Tag label={r.status} color={r.status==="accepted"?T.green:T.textMid} bg={r.status==="accepted"?T.greenDim:T.surfaceUp}/></div>
                  </div>
                  <div style={{color:T.textMid,fontSize:12,lineHeight:1.5,marginBottom:6}}>{r.dx}</div>
                  {r.addr&&<button onClick={()=>openNav(r.addr)} style={{display:"flex",alignItems:"center",gap:5,background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:8,padding:"6px 11px",cursor:"pointer",marginBottom:4,fontFamily:T.font}}>
                    <Ico n="nav" s={12} c={T.blue}/><span style={{color:T.blue,fontSize:11,fontWeight:600}}>{r.addr}</span>
                  </button>}
                  <div style={{color:T.textDim,fontSize:10}}>🏥 {r.sentBy} · {r.sentAt}</div>
                </Card>
              ))}
            </>
          )}
        </>
      )}
      {tab==="map"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:17,marginBottom:12}}>Map View</div>
          <MapView referrals={referrals} clinicians={CLINICIANS} onSelect={r=>setMapSel(s=>s?.id===r.id?null:r)} selectedId={mapSel?.id}/>
          {mapSel?<Card style={{borderLeft:`3px solid ${RISK_C[mapSel.urgency]||T.amber}`}}>
            <div style={{color:T.text,fontWeight:700,fontSize:14,marginBottom:4}}>{mapSel.name}</div>
            <div style={{color:T.textMid,fontSize:12,marginBottom:7}}>{mapSel.dx}</div>
            {mapSel.addr&&<button onClick={()=>openNav(mapSel.addr)} style={{display:"flex",alignItems:"center",gap:6,background:T.blueDim,border:`1px solid ${T.blue}44`,borderRadius:9,padding:"8px 12px",cursor:"pointer",fontFamily:T.font}}><Ico n="nav" s={13} c={T.blue}/><span style={{color:T.blue,fontSize:11,fontWeight:600}}>{mapSel.addr}</span></button>}
          </Card>:<div style={{color:T.textDim,textAlign:"center",fontSize:12,padding:"12px 0"}}>Tap a pin to see details</div>}
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8,marginTop:4}}>Field Clinicians</div>
          {CLINICIANS.map(cl=><Card key={cl.id} style={{padding:"10px 13px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:T.text,fontWeight:700,fontSize:13}}>{cl.name}</div><div style={{color:T.textMid,fontSize:11}}>{cl.role}</div></div><Tag label={cl.status} color={cl.status==="available"?T.green:T.amber} bg={cl.status==="available"?T.greenDim:T.amberDim}/></div></Card>)}
        </>
      )}
      {tab==="team"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:17,marginBottom:14}}>Clinician Roster</div>
          {CLINICIANS.map(cl=><Card key={cl.id}><div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{width:44,height:44,borderRadius:13,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>👩‍⚕️</div><div style={{flex:1}}><div style={{color:T.text,fontWeight:700,fontSize:14}}>{cl.name}</div><div style={{color:T.textMid,fontSize:11}}>{cl.role}</div></div><Tag label={cl.status} color={cl.status==="available"?T.green:T.amber} bg={cl.status==="available"?T.greenDim:T.amberDim}/></div></Card>)}
        </>
      )}
    </Shell>
  );
};

// ─── ADMIN APP ─────────────────────────────────────────────────
const AdminApp=({onLogout})=>{
  const T=useT();
  const AGENCY_ID="ag1";
  const[tab,setTab]=useState("home");
  const[visits,setVisits]=useState(INIT_VISITS.filter(v=>v.agencyId===AGENCY_ID));
  const[invoicePeriod,setInvoicePeriod]=useState(AGENCIES.find(a=>a.id===AGENCY_ID)?.invoicePeriod||"biweekly");
  const[agencyRates,setAgencyRates]=useState(DEF_RATES["ag1"]);
  const[selPt,setSelPt]=useState(null);
  const[searchQ,setSearchQ]=useState("");
  const[showLog,setShowLog]=useState(false);
  const[logForm,setLogForm]=useState({clinicianId:"c1",patientId:"p1",type:"followup",date:TODAY.toISOString().split("T")[0],notes:""});

  const myClinicians=CLINICIANS.filter(c=>c.agencyIds.includes(AGENCY_ID));
  const myPatients=PATIENTS_DB.filter(p=>p.agencyId===AGENCY_ID);
  const getRate=(clinicianId,typeId)=>{const cl=CLINICIANS.find(c=>c.id===clinicianId);return cl?.customRates[AGENCY_ID]?.[typeId]||agencyRates[typeId]||0;};

  const periodLabel=invoicePeriod==="monthly"?"Monthly Invoices":"Biweekly Invoices";
  const filteredPts=searchQ.trim()?myPatients.filter(p=>p.name.toLowerCase().includes(searchQ.toLowerCase())||p.cond.toLowerCase().includes(searchQ.toLowerCase())||p.phone.includes(searchQ)||p.addr.toLowerCase().includes(searchQ.toLowerCase())||p.insurance.toLowerCase().includes(searchQ.toLowerCase())||p.physician.toLowerCase().includes(searchQ.toLowerCase())):myPatients;

  const tabs=[{id:"home",label:"Overview",icon:"home"},{id:"patients",label:"Patients",icon:"users"},{id:"visits",label:"Visits",icon:"visits"},{id:"invoices",label:"Invoices",icon:"inv"},{id:"rates",label:"Rates",icon:"dollar"}];

  if(selPt){
    const pt=myPatients.find(p=>p.id===selPt);
    if(!pt)return null;
    return <Shell tabs={tabs} active={tab} setTab={t=>{setTab(t);setSelPt(null);setSearchQ("");}} onLogout={onLogout} title="SunCare Admin" subtitle="Agency Dashboard" accent={T.blue}>
      <PatientProfile pt={pt} onBack={()=>setSelPt(null)} backLabel="Patients"/>
    </Shell>;
  }

  return(
    <Shell tabs={tabs} active={tab} setTab={setTab} onLogout={onLogout} title="SunCare Admin" subtitle="Agency Dashboard" accent={T.blue}>
      {tab==="home"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            <Stat label="Clinicians" value={myClinicians.length} color={T.blue}/>
            <Stat label="Patients" value={myPatients.length} color={T.purple}/>
            <Stat label="Visits (Active)" value={visits.filter(v=>v.status==="approved").length} color={T.teal}/>
            <Stat label="Invoice Period" value={invoicePeriod==="monthly"?"Monthly":"Biweekly"} color={T.amber}/>
          </div>
          {/* Invoice period toggle */}
          <Card style={{borderLeft:`3px solid ${T.amber}`,marginBottom:14}}>
            <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Invoice Period</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setInvoicePeriod("biweekly")} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${invoicePeriod==="biweekly"?T.amber:T.border}`,background:invoicePeriod==="biweekly"?T.amberDim:T.surface,color:invoicePeriod==="biweekly"?T.amber:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Biweekly (14 days)</button>
              <button onClick={()=>setInvoicePeriod("monthly")} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${invoicePeriod==="monthly"?T.amber:T.border}`,background:invoicePeriod==="monthly"?T.amberDim:T.surface,color:invoicePeriod==="monthly"?T.amber:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Monthly</button>
            </div>
            <div style={{color:T.textDim,fontSize:11,marginTop:8}}>{invoicePeriod==="biweekly"?"Invoices generated every 14 days":"Invoices generated on the last day of each month"}</div>
          </Card>
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:9}}>Clinician Earnings</div>
          {myClinicians.map(cl=>{
            const clVisits=visits.filter(v=>v.clinicianId===cl.id&&v.status==="approved");
            const total=clVisits.reduce((s,v)=>s+getRate(cl.id,v.type),0);
            return <Card key={cl.id}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:T.text,fontWeight:700,fontSize:14}}>{cl.name}</div><div style={{color:T.textMid,fontSize:11}}>{cl.role} · {clVisits.length} visits</div></div><div style={{textAlign:"right"}}><div style={{color:T.green,fontWeight:800,fontSize:16}}>{fmt$(total)}</div><div style={{color:T.textDim,fontSize:10}}>approved</div></div></div></Card>;
          })}
        </>
      )}

      {tab==="patients"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{color:T.text,fontWeight:800,fontSize:17}}>Patients ({myPatients.length})</div>
          </div>
          <div style={{position:"relative",marginBottom:12}}>
            <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Ico n="search" s={14} c={T.textMid}/></div>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search patients, condition, insurance, phone, address…" style={{width:"100%",boxSizing:"border-box",background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:11,padding:"11px 13px 11px 33px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}/>
            {searchQ&&<button onClick={()=>setSearchQ("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.textDim,cursor:"pointer",fontSize:16}}>✕</button>}
          </div>
          {searchQ.trim()&&<div style={{color:T.textDim,fontSize:11,marginBottom:9}}>{filteredPts.length} result{filteredPts.length!==1?"s":""} for "{searchQ}"</div>}
          {filteredPts.map(p=>(
            <Card key={p.id} onClick={()=>setSelPt(p.id)}>
              <div style={{display:"flex",gap:11,alignItems:"center"}}>
                <div style={{background:T.surfaceUp,borderRadius:9,padding:"7px 10px",textAlign:"center",flexShrink:0}}>
                  <div style={{color:p.adh>=70?T.green:p.adh>=50?T.amber:T.red,fontWeight:900,fontSize:16}}>{p.adh}%</div>
                  <div style={{color:T.textDim,fontSize:9}}>ADH</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontWeight:700,fontSize:14}}>{p.name}</div>
                  <div style={{color:T.textMid,fontSize:11,margin:"2px 0 4px"}}>{p.cond}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Tag label={`Risk: ${p.risk}`} color={RISK_C[p.risk]} bg={RISK_BG[p.risk]}/>{p.scheduleFreq&&<Tag label={p.scheduleFreq} color={T.purple} bg={T.purpleDim}/>}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <button onClick={e=>{e.stopPropagation();callPhone(p.phone);}} style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:8,padding:"7px 8px",cursor:"pointer"}}><Ico n="phone" s={13} c={T.green}/></button>
                  <button onClick={e=>{e.stopPropagation();openNav(p.addr);}} style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:8,padding:"7px 8px",cursor:"pointer"}}><Ico n="nav" s={13} c={T.blue}/></button>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab==="visits"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{color:T.text,fontWeight:800,fontSize:17}}>Visit Log</div><div style={{color:T.textMid,fontSize:12}}>Approve before invoicing</div></div>
            <button onClick={()=>setShowLog(v=>!v)} style={{background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:10,padding:"9px 13px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:T.font}}><Ico n="plus" s={12} c="#fff"/>Log</button>
          </div>
          {showLog&&(
            <div style={{background:T.surfaceUp,borderRadius:14,padding:14,marginBottom:11,border:`1px solid ${T.teal}`}}>
              <div style={{color:T.teal,fontWeight:800,fontSize:13,marginBottom:12}}>Log New Visit</div>
              {[{k:"clinicianId",l:"Clinician",opts:myClinicians.map(c=>({v:c.id,l:c.name}))},{k:"patientId",l:"Patient",opts:myPatients.map(p=>({v:p.id,l:p.name}))},{k:"type",l:"Visit Type",opts:VT.map(v=>({v:v.id,l:v.label}))}].map(f=>(
                <div key={f.k} style={{marginBottom:9}}><div style={{color:T.textMid,fontSize:10,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.l}</div><select value={logForm[f.k]} onChange={e=>setLogForm(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 11px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}>{f.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></div>
              ))}
              <div style={{background:T.surface,borderRadius:9,padding:"9px 13px",marginBottom:11,display:"flex",justifyContent:"space-between"}}><span style={{color:T.textMid,fontSize:12}}>Rate</span><span style={{color:T.green,fontWeight:700,fontSize:14}}>{fmt$(getRate(logForm.clinicianId,logForm.type))}</span></div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setShowLog(false)} style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:10,color:T.textMid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>Cancel</button>
                <button onClick={()=>{setVisits(vs=>[{id:`v${Date.now()}`,...logForm,agencyId:AGENCY_ID,status:"pending"},... vs]);setShowLog(false);}} style={{flex:2,background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:9,padding:10,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:T.font}}>Save Visit</button>
              </div>
            </div>
          )}
          {visits.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20).map(v=>{
            const cl=myClinicians.find(c=>c.id===v.clinicianId);
            const pt=myPatients.find(p=>p.id===v.patientId);
            const vt=VT.find(t=>t.id===v.type);
            return <Card key={v.id} style={{padding:"10px 13px",borderLeft:`3px solid ${vt?.color||T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}><span style={{color:T.text,fontWeight:700,fontSize:13}}>{cl?.name}</span><Tag label={vt?.code||v.type} color={vt?.color||T.textMid} bg={`${vt?.color||T.textMid}22`}/></div><div style={{color:T.textMid,fontSize:11}}>👤 {pt?.name} · 📅 {v.date}</div></div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                  <div style={{color:T.green,fontWeight:700,fontSize:13}}>{fmt$(getRate(v.clinicianId,v.type))}</div>
                  {v.status==="pending"?<button onClick={()=>setVisits(vs=>vs.map(x=>x.id===v.id?{...x,status:"approved"}:x))} style={{background:T.greenDim,border:`1px solid ${T.green}44`,borderRadius:7,padding:"4px 8px",color:T.green,fontSize:9,fontWeight:700,cursor:"pointer",marginTop:3,fontFamily:T.font}}>Approve</button>:<Tag label={v.status} color={ST_C[v.status]||T.textMid} bg={`${ST_C[v.status]||T.textMid}22`}/>}
                </div>
              </div>
            </Card>;
          })}
        </>
      )}

      {tab==="invoices"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:17,marginBottom:4}}>{periodLabel}</div>
          <div style={{color:T.textMid,fontSize:12,marginBottom:8}}>Current setting: <span style={{color:T.amber,fontWeight:700}}>{invoicePeriod==="monthly"?"Monthly":"Biweekly (every 14 days)"}</span></div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <button onClick={()=>setInvoicePeriod("biweekly")} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${invoicePeriod==="biweekly"?T.amber:T.border}`,background:invoicePeriod==="biweekly"?T.amberDim:T.surface,color:invoicePeriod==="biweekly"?T.amber:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Biweekly</button>
            <button onClick={()=>setInvoicePeriod("monthly")} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${invoicePeriod==="monthly"?T.amber:T.border}`,background:invoicePeriod==="monthly"?T.amberDim:T.surface,color:invoicePeriod==="monthly"?T.amber:T.textMid,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Monthly</button>
          </div>
          {myClinicians.map(cl=>{
            const clVisits=visits.filter(v=>v.clinicianId===cl.id&&v.status!=="pending"&&v.status!=="scheduled");
            const byType={};let total=0;
            VT.forEach(vt=>{const cnt=clVisits.filter(v=>v.type===vt.id).length;const rate=getRate(cl.id,vt.id);const sub=cnt*rate;byType[vt.id]={count:cnt,rate,subtotal:sub};total+=sub;});
            const visitCount=clVisits.length;
            if(visitCount===0)return null;
            return <Card key={cl.id} style={{borderLeft:`3px solid ${T.blue}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div><div style={{color:T.text,fontWeight:700,fontSize:14}}>{cl.name}</div><div style={{color:T.textMid,fontSize:11,marginTop:2}}>{visitCount} approved visits</div></div>
                <div style={{textAlign:"right"}}><div style={{color:T.green,fontWeight:900,fontSize:18}}>{fmt$(total)}</div></div>
              </div>
              {VT.filter(vt=>byType[vt.id]?.count>0).map(vt=>(
                <div key={vt.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:3,height:11,borderRadius:2,background:vt.color}}/><span style={{color:T.textMid,fontSize:11}}>{byType[vt.id].count}× {vt.code}</span></div>
                  <span style={{color:T.text,fontSize:11,fontWeight:600}}>{fmt$(byType[vt.id].subtotal)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
                <button style={{background:T.purpleDim,border:`1px solid ${T.purple}44`,borderRadius:9,padding:"7px 14px",color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Generate Invoice</button>
                <span style={{color:T.green,fontSize:18,fontWeight:900}}>{fmt$(total)}</span>
              </div>
            </Card>;
          })}
        </>
      )}

      {tab==="rates"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:17,marginBottom:4}}>Visit Rates</div>
          <div style={{color:T.textMid,fontSize:12,marginBottom:14}}>Agency-wide defaults</div>
          {VT.map(vt=>(
            <Card key={vt.id} style={{padding:"11px 13px",borderLeft:`3px solid ${vt.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,marginRight:10}}><div style={{color:vt.color,fontWeight:700,fontSize:11}}>{vt.code}</div><div style={{color:T.textMid,fontSize:10}}>{vt.label}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{color:T.textMid,fontSize:12}}>$</span><input type="number" value={agencyRates[vt.id]||""} onChange={e=>setAgencyRates(r=>({...r,[vt.id]:Number(e.target.value)}))} style={{width:58,background:T.surfaceUp,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 8px",color:T.text,fontSize:13,fontWeight:700,outline:"none",textAlign:"right",fontFamily:T.font}}/></div>
              </div>
            </Card>
          ))}
        </>
      )}
    </Shell>
  );
};

// ─── SUPER ADMIN ───────────────────────────────────────────────
const SuperAdmin=({onLogout})=>{
  const T=useT();
  const[tab,setTab]=useState("home");
  const totalMRR=AGENCIES.reduce((a,ag)=>a+(ag.plan==="enterprise"?1999:ag.plan==="growth"?999:499),0);
  const tabs=[{id:"home",label:"Overview",icon:"home"},{id:"agencies",label:"Agencies",icon:"shield"},{id:"revenue",label:"Revenue",icon:"dollar"},{id:"platform",label:"Platform",icon:"set"}];
  return(
    <Shell tabs={tabs} active={tab} setTab={setTab} onLogout={onLogout} title="Super Admin" subtitle="HomeHealth Connect Platform" accent={T.purple}>
      {tab==="home"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            <Stat label="Platform MRR" value={fmt$(totalMRR)} color={T.green} sub="↑ +12% MoM"/>
            <Stat label="Agencies" value={AGENCIES.length} color={T.purple}/>
            <Stat label="Clinicians" value="56" color={T.blue}/>
            <Stat label="Patients" value="386" color={T.teal}/>
          </div>
          <Card style={{background:`linear-gradient(135deg,#12093A,${T.surface})`,border:`1px solid ${T.purpleDim}`}}>
            <div style={{color:T.textMid,fontSize:12}}>Annual Recurring Revenue</div>
            <div style={{color:T.green,fontSize:28,fontWeight:900,letterSpacing:-1}}>{fmt$(totalMRR*12)}</div>
          </Card>
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",margin:"14px 0 9px"}}>Agencies</div>
          {AGENCIES.map(ag=>{
            const pc=ag.plan==="enterprise"?T.purple:ag.plan==="growth"?T.blue:T.teal;
            return <Card key={ag.id} style={{borderLeft:`3px solid ${pc}`}}><div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:20}}>{ag.logo}</span><div style={{flex:1}}><div style={{color:T.text,fontWeight:700}}>{ag.name}</div><div style={{color:T.textMid,fontSize:11}}>{ag.city} · {ag.plan} · <span style={{color:T.amber}}>{ag.invoicePeriod}</span></div></div><div style={{color:T.green,fontWeight:800}}>${ag.plan==="enterprise"?1999:ag.plan==="growth"?999:499}/mo</div></div></Card>;
          })}
        </>
      )}
      {tab==="agencies"&&AGENCIES.map(ag=>{const pc=ag.plan==="enterprise"?T.purple:ag.plan==="growth"?T.blue:T.teal;return <Card key={ag.id} style={{borderLeft:`3px solid ${pc}`}}><div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:22}}>{ag.logo}</span><div style={{flex:1}}><div style={{color:T.text,fontWeight:700}}>{ag.name}</div><div style={{color:T.textMid,fontSize:11}}>{ag.plan} · {ag.invoicePeriod} invoicing</div></div><div style={{color:T.green,fontWeight:800}}>${ag.plan==="enterprise"?1999:999}/mo</div></div></Card>;})}
      {tab==="revenue"&&[{plan:"enterprise",col:T.purple,p:1999},{plan:"growth",col:T.blue,p:999},{plan:"starter",col:T.teal,p:499}].map(t=>{const cnt=AGENCIES.filter(a=>a.plan===t.plan).length;return <Card key={t.plan} style={{borderLeft:`3px solid ${t.col}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><Tag label={t.plan} color={t.col} bg={`${t.col}22`}/><div style={{color:T.textMid,fontSize:11,marginTop:5}}>{cnt} agenc{cnt===1?"y":"ies"} · ${t.p}/mo</div></div><div style={{color:t.col,fontWeight:900,fontSize:20}}>{fmt$(cnt*t.p)}</div></div></Card>;})}
      {tab==="platform"&&[["🔒","HIPAA & Compliance","BAA, audit logs, encryption"],["💳","Billing Engine","Stripe, biweekly & monthly invoices"],["🤖","AI Risk Model","Adherence, readmission alerts"],["📡","EHR Integrations","Epic, Cerner, MatrixCare"]].map(([i,l,d])=><Card key={l} style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:22}}>{i}</span><div><div style={{color:T.text,fontWeight:600}}>{l}</div><div style={{color:T.textMid,fontSize:11}}>{d}</div></div></Card>)}
    </Shell>
  );
};

// ─── PATIENT APP ───────────────────────────────────────────────
const PatientApp=({onLogout})=>{
  const T=useT();
  const[tab,setTab]=useState("home");
  const[done,setDone]=useState([]);
  const[msgs,setMsgs]=useState([{from:"c1",text:"How is your hip feeling today?",time:"9:10 AM"}]);
  const[msgText,setMsgText]=useState("");
  const pt=PATIENTS_DB[0];
  const myExs=ALL_EX.filter(e=>pt.hep?.includes(e.id));
  const r=26,circ=2*Math.PI*r;
  const tabs=[{id:"home",label:"Home",icon:"home"},{id:"hep",label:"Exercises",icon:"hep"},{id:"schedule",label:"Schedule",icon:"cal"},{id:"messages",label:"Messages",icon:"chat"}];
  const APPTS=[{type:"OT Visit – Dr. Patel",date:"May 19",time:"10:00 AM",loc:"Home Visit",color:T.teal},{type:"Doctor – Dr. Reyes",date:"May 21",time:"2:00 PM",loc:"St. Luke's Clinic",color:T.red},{type:"OT Visit – Dr. Patel",date:"May 24",time:"11:00 AM",loc:"Home Visit",color:T.teal}];
  return(
    <Shell tabs={tabs} active={tab} setTab={setTab} onLogout={onLogout} title={`Hi, ${pt.name.split(" ")[0]} 👋`} subtitle="Patient Portal" accent={T.teal}>
      {tab==="home"&&(
        <>
          <Card style={{background:`linear-gradient(135deg,#071828,${T.surface})`,border:`1px solid ${T.tealDim}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{color:T.textMid,fontSize:12}}>Today's Adherence</div><div style={{color:T.text,fontSize:28,fontWeight:900,letterSpacing:-1}}>{pt.adh}%</div><div style={{color:T.red,fontSize:12,marginTop:4}}>⚠️ Below target — keep going!</div></div>
              <svg width={65} height={65} style={{transform:"rotate(-90deg)"}}><circle cx={32} cy={32} r={r} fill="none" stroke={T.surfaceUp} strokeWidth="6"/><circle cx={32} cy={32} r={r} fill="none" stroke={T.red} strokeWidth="6" strokeDasharray={`${(pt.adh/100)*circ} ${circ}`} strokeLinecap="round"/><text x="50%" y="50%" fill={T.red} fontSize="11" fontWeight="800" textAnchor="middle" dominantBaseline="middle" style={{transform:"rotate(90deg)",transformOrigin:"32px 32px"}}>{pt.adh}%</text></svg>
            </div>
          </Card>
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8}}>Today's Exercises</div>
          {myExs.slice(0,3).map(ex=>(
            <Card key={ex.id} style={{padding:"11px 13px",borderLeft:`3px solid ${RC[ex.r]||T.teal}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{color:T.text,fontWeight:700,fontSize:13}}>{ex.name}</div><div style={{color:T.textMid,fontSize:11}}>{ex.sets} sets · {ex.reps} reps · {ex.dur}</div></div>
                <button onClick={()=>setDone(d=>d.includes(ex.id)?d.filter(x=>x!==ex.id):[...d,ex.id])} style={{width:32,height:32,borderRadius:9,border:"none",cursor:"pointer",background:done.includes(ex.id)?T.green:T.surfaceUp,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}><Ico n="chk" s={14} c={done.includes(ex.id)?"#fff":T.textDim}/></button>
              </div>
            </Card>
          ))}
          <div style={{color:T.textMid,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",margin:"14px 0 8px"}}>Care Team</div>
          {CLINICIANS.filter(c=>c.agencyIds.includes(pt.agencyId)).slice(0,2).map(c=>(
            <Card key={c.id} style={{padding:"11px 13px",display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>👩‍⚕️</div>
              <div style={{flex:1}}><div style={{color:T.text,fontWeight:700,fontSize:13}}>{c.name}</div><div style={{color:T.textMid,fontSize:11}}>{c.role}</div></div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>callPhone("(305) 555-0001")} style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:8,padding:"7px 8px",cursor:"pointer"}}><Ico n="phone" s={13} c={T.green}/></button>
                <button onClick={()=>setTab("messages")} style={{background:T.blueDim,border:`1px solid ${T.blue}33`,borderRadius:8,padding:"7px 8px",cursor:"pointer"}}><Ico n="chat" s={13} c={T.blue}/></button>
              </div>
            </Card>
          ))}
        </>
      )}
      {tab==="hep"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:17,marginBottom:4}}>My Exercise Plan</div>
          <div style={{color:T.textMid,fontSize:12,marginBottom:12}}>{myExs.length} exercises · {pt.scheduleFreq} schedule</div>
          {myExs.map(ex=><ExerciseCard key={ex.id} ex={ex} compact={false} onAdd={()=>setDone(d=>d.includes(ex.id)?d.filter(x=>x!==ex.id):[...d,ex.id])} added={done.includes(ex.id)}/>)}
        </>
      )}
      {tab==="schedule"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:17,marginBottom:14}}>My Schedule</div>
          <Card style={{borderLeft:`3px solid ${T.purple}`,marginBottom:14}}>
            <div style={{color:T.textMid,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Visit Schedule</div>
            <div style={{color:T.purple,fontSize:22,fontWeight:900}}>{pt.scheduleFreq}</div>
            <div style={{color:T.textMid,fontSize:12,marginTop:4}}>Twice weekly for 4 weeks · {pt.scheduleDays?.join(", ")}</div>
          </Card>
          {APPTS.map((a,i)=>(
            <Card key={i} style={{borderLeft:`3px solid ${a.color}`}}>
              <div style={{display:"flex",gap:13,alignItems:"center"}}>
                <div style={{background:T.surfaceUp,borderRadius:9,padding:"8px 11px",textAlign:"center",minWidth:44,flexShrink:0}}><div style={{color:T.text,fontWeight:800,fontSize:16}}>{a.date.split(" ")[1]}</div><div style={{color:T.textMid,fontSize:9}}>{a.date.split(" ")[0].toUpperCase()}</div></div>
                <div><div style={{color:T.text,fontWeight:700,fontSize:13}}>{a.type}</div><div style={{color:T.textMid,fontSize:11,marginTop:3}}>🕐 {a.time} · 📍 {a.loc}</div></div>
              </div>
            </Card>
          ))}
        </>
      )}
      {tab==="messages"&&(
        <>
          <div style={{color:T.text,fontWeight:800,fontSize:17,marginBottom:12}}>Messages</div>
          <div style={{background:T.surface,borderRadius:14,padding:13,minHeight:240,border:`1px solid ${T.border}`,marginBottom:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{marginBottom:10,display:"flex",flexDirection:"column",alignItems:m.from==="patient"?"flex-end":"flex-start"}}>
                <div style={{background:m.from==="patient"?`linear-gradient(135deg,${T.teal},${T.blue})`:T.surfaceUp,borderRadius:m.from==="patient"?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 13px",maxWidth:"80%"}}><div style={{color:T.text,fontSize:13}}>{m.text}</div></div>
                <div style={{color:T.textDim,fontSize:10,marginTop:3,padding:"0 3px"}}>{m.time}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:7}}>
            <input value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Type a message..." style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,padding:"11px 13px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font}}/>
            <button onClick={()=>{if(msgText.trim()){setMsgs(m=>[...m,{from:"patient",text:msgText.trim(),time:"Just now"}]);setMsgText("");}}} style={{background:`linear-gradient(135deg,${T.teal},${T.blue})`,border:"none",borderRadius:11,padding:"0 14px",cursor:"pointer"}}><Ico n="chk" s={17} c="#fff"/></button>
          </div>
        </>
      )}
    </Shell>
  );
};

// ─── ROOT ──────────────────────────────────────────────────────
function App(){
  const[role,setRole]=useState(null);
  const[dark,setDark]=useState(true);
  const theme={dark,setDark};
  const wrap=node=><ThemeCtx.Provider value={theme}>{node}</ThemeCtx.Provider>;
  if(!role)return wrap(<Login onLogin={setRole}/>);
  if(role==="superadmin")return wrap(<SuperAdmin onLogout={()=>setRole(null)}/>);
  if(role==="admin")return wrap(<AdminApp onLogout={()=>setRole(null)}/>);
  if(role==="staffing")return wrap(<StaffingApp onLogout={()=>setRole(null)}/>);
  if(role==="clinician")return wrap(<ClinicianApp onLogout={()=>setRole(null)}/>);
  if(role==="patient")return wrap(<PatientApp onLogout={()=>setRole(null)}/>);
  return wrap(<AdminApp onLogout={()=>setRole(null)}/>);
}
