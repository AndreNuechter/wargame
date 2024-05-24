(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function r(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(a){if(a.ep)return;a.ep=!0;const n=r(a);fetch(a.href,n)}})();const V=""+new URL("service-worker.js",import.meta.url).href;window.navigator.serviceWorker.register(V).catch(console.error);let S;async function Q(){var e,t;S=await((t=(e=navigator.wakeLock)==null?void 0:e.request)==null?void 0:t.call(e,"screen"))}async function X(){S&&(await S.release(),S=void 0)}const O={request:Q,release:X},g={width:30,height:24};function q(e){return e%2===0}function Z(e,t,r){return e>=t&&e<=r}function ee(e,t=0,r=e.length){return e[$(r,t)]}function $(e,t=0){return Math.trunc(Math.random()*(e-t)+t)}function C(e){e.forEach(t=>{t.neighbors=te(t,e,g)})}function te({q:e,r:t,s:r,x:o,y:a},n,s){const _=[{q:1,r:0,s:-1},{q:1,r:-1,s:0},{q:0,r:1,s:-1},{q:0,r:-1,s:1},{q:-1,r:0,s:1},{q:-1,r:1,s:0}].map(i=>n.find(m=>m.q===e+i.q&&m.r===t+i.r&&m.s===r+i.s)).filter(Boolean);return o===0&&(_.push(n.find(i=>a===i.y&&i.x===s.width-1)),q(a)&&_.push(...[a<s.height-1?n.find(i=>a+1===i.y&&i.x===s.width-1):null,a>0?n.find(i=>a-1===i.y&&i.x===s.width-1):null].filter(Boolean))),o===s.width-1&&(_.push(n.find(i=>a===i.y&&i.x===0)),q(a)||_.push(...[a<s.height-1?n.find(i=>a+1===i.y&&i.x===0):null,a>0?n.find(i=>a-1===i.y&&i.x===0):null].filter(Boolean))),_}const p={freezing:"freezing",cold:"cold",temperate:"temperate",warm:"warm",hot:"hot"};function z(e){e.forEach(t=>{const r=Math.random(),o=-1,a=Z(r,.3,.7)?0:1*(-1*+(r<.3)),n=(s=>s<0?0:s>g.height-1?g.height-1:s)(t.y+a+o);t.temperature=re(n)})}function re(e){switch(e){case 0:case 1:case g.height-2:case g.height-1:return p.freezing;case 2:case 3:case g.height-4:case g.height-3:return p.cold;case 4:case 5:case g.height-6:case g.height-5:return p.temperate;case 6:case 7:case 8:case g.height-9:case g.height-8:case g.height-7:return p.warm;default:return p.hot}}function ne(e){switch(e){case p.hot:return p.warm;case p.warm:return p.temperate;case p.temperate:return p.cold;default:return p.freezing}}function ae(e){switch(e){case p.freezing:return p.cold;case p.cold:return p.temperate;case p.temperate:return p.warm;default:return p.hot}}const M=new Set([0,1,2,g.height-1,g.height-2,g.height-3]);function P(e){const o=e.length/2.5;let a=0;for(;a<o;){const n=$(13,4),s={x:$(g.width),y:$(g.height-3,3)},f=e.find(({x:m,y:l})=>m===s.x&&l===s.y),_=new Set(f.neighbors.filter(({y:m})=>!M.has(m))),i=new Set;a+=n,N(f),i.add(f);for(let m=0;m<n;m+=1){const l=ee([..._]);N(l),i.add(l),_.delete(l),l.neighbors.filter(y=>!i.has(y)).filter(({y})=>!M.has(y)).forEach(y=>_.add(y))}}e.filter(n=>n.elevation>0).forEach(n=>{const s=n.neighbors.filter(_=>_.elevation>0).length;if(s>=3)return;const f=Math.random();(s===2&&f>.7||s===1&&f<.7)&&oe(n)})}function N(e){e.elevation+=1,e.elevation>1&&(e.temperature=ne(e.temperature))}function oe(e){e.elevation=Math.max(0,e.elevation-1),e.elevation>0&&(e.temperature=ae(e.temperature))}const d={arid:"arid",dry:"dry",moderate:"moderate",moist:"moist",wet:"wet"};function se(e){switch(e){case d.arid:return d.dry;case d.dry:return d.moderate;case d.moderate:return d.moist;default:return d.wet}}function j(e){e.filter(t=>t.elevation>0).forEach(t=>{t.neighbors.filter(({biome:r})=>r===c.sea.name).forEach(()=>{t.humidity=se(t.humidity)})})}const c={sea:new h("sea"),mountain:new h("mountain"),high_mountain:new h("high_mountain"),ice:new h("ice"),tundra:new h("tundra"),grassland:new h("grassland"),savanna:new h("savanna"),boreal_forest:new h("boreal_forest"),forest:new h("forest"),tropical_rainforest:new h("tropical_rainforest"),cold_swamp:new h("cold_swamp"),swamp:new h("swamp"),tropical_swamp:new h("tropical_swamp"),desert:new h("desert"),extreme_desert:new h("extreme_desert")},ie={[p.freezing]:{[d.arid]:c.tundra.name,[d.dry]:c.tundra.name,[d.moderate]:c.tundra.name,[d.moist]:c.boreal_forest.name,[d.wet]:c.boreal_forest.name},[p.cold]:{[d.arid]:c.tundra.name,[d.dry]:c.tundra.name,[d.moderate]:c.boreal_forest.name,[d.moist]:c.boreal_forest.name,[d.wet]:c.boreal_forest.name},[p.temperate]:{[d.arid]:c.tundra.name,[d.dry]:c.forest.name,[d.moderate]:c.forest.name,[d.moist]:c.forest.name,[d.wet]:c.swamp.name},[p.warm]:{[d.arid]:c.desert.name,[d.dry]:c.grassland.name,[d.moderate]:c.savanna.name,[d.moist]:c.forest.name,[d.wet]:c.tropical_swamp.name},[p.hot]:{[d.arid]:c.extreme_desert.name,[d.dry]:c.desert.name,[d.moderate]:c.grassland.name,[d.moist]:c.savanna.name,[d.wet]:c.tropical_rainforest.name}};function h(e="",t=0,r={wood:[1,5],stone:[1,5],food:[1,5]}){return{name:e,movement_resistance:t,resource_production:r}}function D(e){e.forEach(t=>{t.biome=le(t)})}function R(e){e.filter(({elevation:t})=>t===0).forEach(t=>{t.biome=ce(t)})}function ce(e,t=g.height){const r=Math.random();return[0,t-1].includes(e.y)?r<=.1?c.sea.name:c.ice.name:[1,t-2].includes(e.y)?r<=.75?c.sea.name:c.ice.name:[2,t-3].includes(e.y)?r<=.9?c.sea.name:c.ice.name:c.sea.name}function le(e){return e.biome?e.biome:e.elevation>1?e.elevation>2?c.high_mountain.name:c.mountain.name:ie[e.temperature][e.humidity]}const T=document.createElement("style");T.textContent=Object.values(c).map(e=>`[data-biome="${e.name}"] {
        fill: var(--${e.name});
    }`).join(`
`);document.body.append(T);const de=document.getElementById("add-player-btn"),k=document.getElementById("board"),B=document.getElementById("borders"),ue=document.getElementById("cell-info"),me=document.getElementById("toggle-coord-system-btn"),A=document.getElementById("config-game-form"),U=document.getElementById("end-turn-btn"),E=document.getElementsByClassName("player-config"),x=document.getElementById("player-setup"),fe=document.getElementById("reroll-map-btn");document.getElementById("round-info");const pe=document.getElementById("start-game-form"),b=document.getElementById("start-game-overlay"),_e=(()=>{const e=document.createElementNS("http://www.w3.org/2000/svg","use"),t=document.createElementNS("http://www.w3.org/2000/svg","g");return e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","#outer-hex"),e.classList.add("outer-cell"),t.classList.add("cell"),t.append(e),t})(),ge=document.getElementById("player-config-tmpl").content;function W(e,t,r,o,a,n,s){const f=he(e,t,r,o,a,n,s);let _="",i=-1;return{cx:e,cy:t,x:r,y:o,q:a,r:n,s,neighbors:[],cell:f,elevation:0,humidity:d.arid,temperature:p.freezing,get biome(){return _},set biome(m){_=m,f.dataset.biome=m},get owner_id(){return i},set owner_id(m){if(m!==void 0){if(i=m,m===-1){f.firstChild.classList.remove("owned");return}f.dataset.owner_id=m,f.firstChild.classList.add("owned")}}}}function he(e,t,r,o,a,n,s){const f=_e.cloneNode(!0);f.setAttribute("transform",`translate(${e}, ${t})`);const _=document.createElementNS("http://www.w3.org/2000/svg","g"),i=document.createElementNS("http://www.w3.org/2000/svg","text"),m=document.createElementNS("http://www.w3.org/2000/svg","text"),l=document.createElementNS("http://www.w3.org/2000/svg","text"),y=document.createElementNS("http://www.w3.org/2000/svg","text");return i.textContent=a,m.textContent=n,l.textContent=s,y.textContent=`${r}, ${o}`,i.setAttribute("transform","translate(1.5, 2)"),m.setAttribute("transform","translate(4.5, 3.5)"),l.setAttribute("transform","translate(2, 5)"),y.setAttribute("transform","translate(1.5, 3.5)"),_.classList.add("cell-coord"),i.classList.add("cube-coord"),m.classList.add("cube-coord"),l.classList.add("cube-coord"),y.classList.add("offset-coord"),_.append(i,m,l,y),f.append(_),k.prepend(f),f}function Y(e){const t=[...e.values()];return t.forEach(r=>Object.assign(r,{biome:"",elevation:0,humidity:d.arid,temperature:p.freezing,owner_id:-1})),z(t),P(t),R(t),j(t),D(t),e}function ye(e,t){const r=e.map(({cx:o,cy:a,x:n,y:s,q:f,r:_,s:i,biome:m,elevation:l,humidity:y,temperature:G,owner_id:K})=>Object.assign(W(o,a,n,s,f,_,i),{biome:m,elevation:l,humidity:y,temperature:G,owner_id:K}));return C(r),H(r,t)}function we(e,t){const r=be(e);return C(r),z(r),P(r),R(r),j(r),D(r),H(r,t)}function H(e,t){return e.reduce((r,o)=>(r.set(o.cell,o),r),t)}function be({height:e,width:t}){const r=[];for(let o=0;o<e;o+=1){const a=+!q(o);for(let n=0;n<t;n+=1){const s=n-(o-(o&1))/2;r.push(W(n*6+a*3,o*4.5,n,o,s,o,-s-o))}}return r}const ve={human:"human",ai:"ai"};function J(e){const t=ge.cloneNode(!0);Object.assign(t.querySelector(".player-name-input"),{name:`player-${e}-name`,value:`Player ${e}`}),t.querySelectorAll(".player-type-select-radio").forEach(r=>{r.name=`player-${e}-type`}),x.append(t)}function F(e,t=ve.ai,r){let o=e;return{get name(){return o},set name(a){a!==""&&(o=a)},color:r,type:t,cells:[]}}const w={land_grab:L("land_grab","Pick your origin","Confirm choice"),development:L("development","Distribute your wealth"),movement_planning:L("movement_planning","Make your moves"),movement_execution:L("movement_execution","See what you have done")};function L(e,t=e,r="End turn"){return{name:e,call_to_action:t,end_turn_btn_label:r}}const u=(()=>{const e=[];let t=0,r=w.land_grab.name,o=0;function a(){U.textContent=w[r].end_turn_btn_label,document.getElementById("phase-label").textContent=w[r].call_to_action,document.getElementById("player-name").textContent=e[o].name}return{board:new Map,get round(){return t},set round(n){t=n},get players(){return e},set players(n){e.push(...n)},get current_player_id(){return o},set current_player_id(n){o=n},clear_players(){e.length=0},get current_phase(){return r},set current_phase(n){r=n},next_turn(){o===e.length-1?(o=0,r=(()=>{switch(r){case w.development.name:return w.movement_planning.name;case w.movement_planning.name:return w.movement_execution.name;default:return t+=1,w.development.name}})()):o+=1,a()},run:a}})();function Ee(e,t){const r=JSON.parse(t);Object.assign(e,{round:r.round,current_phase:r.current_phase,current_player_id:r.current_player_id,players:r.players.map(({name:o,type:a,color:n})=>F(o,a,n)),board:ye(r.board,e.board)}),e.players.forEach((o,a)=>{o.cells=[...e.board.values()].filter(n=>n.owner_id===a).map(({cell:n})=>n)})}function I(e,t){const r=[];e.reduce((a,n)=>{const s=n.neighbors.filter(l=>!e.includes(l)),f=Le(n),_=Se(n),i=Ie(n),m=ke(n);return s.find(l=>l.r===n.r&&l.s===n.s+1)&&a.push(`M${m} v-3`),s.find(l=>l.r===n.r&&l.s===n.s-1)&&a.push(`M${i} v-3`),s.find(l=>l.q===n.q&&l.s===n.s+1)&&a.push(`M${f} L${$e(n)}`),s.find(l=>l.q===n.q&&l.s===n.s-1)&&a.push(`M${_} L${i}`),s.find(l=>l.s===n.s&&l.r===n.r-1)&&a.push(`M${f} L${qe(n)}`),s.find(l=>l.s===n.s&&l.r===n.r+1)&&a.push(`M${_} L${m}`),a},r);const o=document.createElementNS("http://www.w3.org/2000/svg","path");o.setAttribute("d",r.join("")),o.setAttribute("stroke",t),o.setAttribute("stroke-width","0.3"),B.append(o)}function Le(e){return`${e.cx+3} ${e.cy}`}function Se(e){return`${e.cx+3} ${e.cy+6}`}function $e(e){return`${e.cx} ${e.cy+1.5}`}function ke(e){return`${e.cx} ${e.cy+4.5}`}function qe(e){return`${e.cx+6} ${e.cy+1.5}`}function Ie(e){return`${e.cx+6} ${e.cy+4.5}`}let v=null;window.addEventListener("DOMContentLoaded",()=>{const e=localStorage.getItem("wargame-savegame"),t=e!==null;b.dataset.priorSave=t,b.showModal(),O.request(),t?Ee(u,e):u.board=we(g,u.board)},{once:!0});window.addEventListener("beforeunload",()=>{if(O.release(),u.players.length===0){localStorage.removeItem("wargame-savegame");return}localStorage.setItem("wargame-savegame",JSON.stringify({round:u.round,current_phase:u.current_phase,current_player_id:u.current_player_id,players:u.players.map(({name:e,type:t,color:r})=>({name:e,type:t,color:r})),board:[...u.board.values()].map(({cx:e,cy:t,x:r,y:o,q:a,r:n,s,biome:f,elevation:_,humidity:i,temperature:m,owner_id:l})=>({cx:e,cy:t,x:r,y:o,q:a,r:n,s,biome:f,elevation:_,humidity:i,temperature:m,owner_id:l}))}))});pe.addEventListener("submit",e=>{if(e.preventDefault(),e.submitter.id==="new-game-btn")b.dataset.priorSave==="true"&&(Object.assign(u,{round:0,current_phase:w.land_grab.name,current_player_id:0}),u.board=Y(u.board),u.clear_players()),Array.from({length:2},(t,r)=>J(r+1)),b.classList.add("game-config");else{if(b.dataset.priorSave==="false")return;u.run(),b.close()}});fe.addEventListener("click",()=>{u.board=Y(u.board)});U.addEventListener("click",()=>{if(u.current_phase===w.land_grab.name){if(v===null)return;u.board.get(v).owner_id=u.current_player_id,u.players[u.current_player_id].cells.push(v),B.replaceChildren(),I(u.players[u.current_player_id].cells.map(e=>u.board.get(e)),u.players[u.current_player_id].color),v=null}u.next_turn()});A.addEventListener("submit",e=>{e.preventDefault();const t=new Set,r=[...A.querySelectorAll(".player-name-input")];if(r.reduce((a,{value:n})=>(a[n]=n in a?a[n]+1:1,a[n]>1&&t.add(n),a),{}),t.size!==0){r.forEach(a=>{t.has(a.value)&&a.classList.add("invalid")});return}const o=["tomato","rebeccapurple","gold","aquamarine","hotpink"];u.players=Array.from(E,(a,n)=>{const s=a.querySelector(".player-name-input").value,f=a.querySelector(".player-type-select-radio:checked").value;return F(s,f,o[n])}),u.run(),b.close()});de.addEventListener("click",()=>{E.length!==5&&J(E.length+1)});x.addEventListener("click",({target:e})=>{e.closest(".delete-player-btn")&&E.length!==2&&(e.closest(".player-config").remove(),[...E].forEach((t,r)=>{r=r+1,Object.assign(t.querySelector(".player-name-input"),{name:`player-${r}-name`,value:`Player ${r}`}),t.querySelectorAll(".player-type-select-radio").forEach(o=>{o.name=`player-${r}-type`})}))});b.addEventListener("cancel",e=>e.preventDefault());me.addEventListener("click",()=>{document.body.classList.toggle("use-offset-coords")});k.addEventListener("click",({target:e})=>{const t=e.closest(".cell");if(!t)return;const r=k.querySelector(".clicked"),o=u.board.get(t);if(!(r&&(r.classList.remove("clicked"),B.replaceChildren(),v=null,r===t))){if(t.classList.add("clicked"),I([o],"yellow"),I(o.neighbors,"white"),u.current_phase===w.land_grab.name){if(o.owner_id!==-1||o.biome===c.sea.name)return;v=t}else if(u.current_phase===w.development.name&&o.owner_id!==u.current_player_id)return}});k.addEventListener("pointerover",({target:e})=>{const t=e.closest(".cell");if(!t)return;const r=u.board.get(t);ue.textContent=`
        biome: ${r.biome},
        temperature: ${r.temperature},
        humidity: ${r.humidity},
        elevation: ${r.elevation}
    `});
