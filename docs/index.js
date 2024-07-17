(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function r(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=r(o);fetch(o.href,a)}})();const Ae=""+new URL("service-worker.js",import.meta.url).href;window.navigator.serviceWorker.register(Ae).catch(console.error);let W;se(),document.addEventListener("visibilitychange",()=>{document.hidden?Pe():se()});async function se(){var e,t;W=await((t=(e=navigator.wakeLock)==null?void 0:e.request)==null?void 0:t.call(e,"screen"))}async function Pe(){W&&(await W.release(),W=void 0)}const b={width:30,height:24};function Z(e){return e%2===0}function Re(e,t,r){return e>=t&&e<=r}function Te(e,t=0,r=e.length){return e[Y(r,t)]}function Y(e,t=0){return Math.trunc(Math.random()*(e-t)+t)}function de(e){return Object.freeze(Object.assign(Object.create(null),e))}function _e(e){e.preventDefault()}function me(e){e.forEach(t=>{t.neighbors=Ue(t,e,b)})}function Ue({q:e,r:t,s:r,x:s,y:o},a,c){const u=[{q:1,r:0,s:-1},{q:1,r:-1,s:0},{q:0,r:1,s:-1},{q:0,r:-1,s:1},{q:-1,r:0,s:1},{q:-1,r:1,s:0}].map(i=>a.find(m=>m.q===e+i.q&&m.r===t+i.r&&m.s===r+i.s)).filter(Boolean);return s===0&&(u.push(a.find(i=>o===i.y&&i.x===c.width-1)),Z(o)&&u.push(...[o<c.height-1?a.find(i=>o+1===i.y&&i.x===c.width-1):null,o>0?a.find(i=>o-1===i.y&&i.x===c.width-1):null].filter(Boolean))),s===c.width-1&&(u.push(a.find(i=>o===i.y&&i.x===0)),Z(o)||u.push(...[o<c.height-1?a.find(i=>o+1===i.y&&i.x===0):null,o>0?a.find(i=>o-1===i.y&&i.x===0):null].filter(Boolean))),u}const g={freezing:"freezing",cold:"cold",temperate:"temperate",warm:"warm",hot:"hot"};function pe(e){e.forEach(t=>{const r=Math.random(),s=-1,o=Re(r,.3,.7)?0:1*(-1*+(r<.3)),a=(c=>c<0?0:c>b.height-1?b.height-1:c)(t.y+o+s);t.temperature=xe(a)})}function xe(e){switch(e){case 0:case 1:case b.height-2:case b.height-1:return g.freezing;case 2:case 3:case b.height-4:case b.height-3:return g.cold;case 4:case 5:case b.height-6:case b.height-5:return g.temperate;case 6:case 7:case 8:case b.height-9:case b.height-8:case b.height-7:return g.warm;default:return g.hot}}function De(e){switch(e){case g.hot:return g.warm;case g.warm:return g.temperate;case g.temperate:return g.cold;default:return g.freezing}}function Fe(e){switch(e){case g.freezing:return g.cold;case g.cold:return g.temperate;case g.temperate:return g.warm;default:return g.hot}}const ce=new Set([0,1,2,b.height-1,b.height-2,b.height-3]);function fe(e){const s=e.length/2.5;let o=0;for(;o<s;){const a=Y(13,4),c={x:Y(b.width),y:Y(b.height-3,3)},l=e.find(({x:m,y:h})=>m===c.x&&h===c.y),u=new Set(l.neighbors.filter(({y:m})=>!ce.has(m))),i=new Set;o+=a,ie(l),i.add(l);for(let m=0;m<a;m+=1){const h=Te([...u]);ie(h),i.add(h),u.delete(h),h.neighbors.filter(_=>!i.has(_)).filter(({y:_})=>!ce.has(_)).forEach(_=>u.add(_))}}e.filter(a=>a.elevation>0).forEach(a=>{const c=a.neighbors.filter(u=>u.elevation>0).length;if(c>=3)return;const l=Math.random();(c===2&&l>.7||c===1&&l<.7)&&Je(a)})}function ie(e){e.elevation+=1,e.elevation>1&&(e.temperature=De(e.temperature))}function Je(e){e.elevation=Math.max(0,e.elevation-1),e.elevation>0&&(e.temperature=Fe(e.temperature))}const p={arid:"arid",dry:"dry",moderate:"moderate",moist:"moist",wet:"wet"};function He(e){switch(e){case p.arid:return p.dry;case p.dry:return p.moderate;case p.moderate:return p.moist;default:return p.wet}}function ye(e){e.filter(t=>t.elevation>0).forEach(t=>{t.neighbors.filter(({biome:r})=>r===d.sea).forEach(()=>{t.humidity=He(t.humidity)})})}const n=de({people:"people",gold:"gold",cloth:"cloth",wood:"wood",stone:"stone",iron:"iron",food:"food",alcohol:"alcohol"}),We=de({[n.people]:5,[n.gold]:5,[n.cloth]:25,[n.wood]:25,[n.stone]:25,[n.iron]:0,[n.food]:50,[n.alcohol]:5});function D(e,t=1){const r={[n.people]:0,[n.gold]:0,[n.cloth]:0,[n.wood]:0,[n.stone]:0,[n.iron]:0,[n.food]:0,[n.alcohol]:0};let s=0;return e.forEach(o=>{s+=o.resources.people,Object.entries(o.biome.resource_production).forEach(([a,c])=>{r[a]+=c}),[...o.structures.entries()].forEach(([a,c])=>{a.output.forEach(({resource_name:l,amount:u})=>{r[l]+=u*c})});for(let a=0;a<Math.floor(o.resources.people/2);a+=1){const c=Math.random();c<.3?r[n.people]+=2:c<.8&&(r[n.people]+=1)}}),r[n.gold]=s*t,r}const d={sea:new S("sea",{[n.food]:1}),mountain:new S("mountain",{[n.wood]:2,[n.stone]:5,[n.food]:3}),high_mountain:new S("high_mountain",{[n.stone]:5}),ice:new S("ice",{[n.food]:2}),tundra:new S("tundra",{[n.cloth]:1,[n.wood]:2,[n.stone]:1,[n.food]:5}),grassland:new S("grassland",{[n.cloth]:3,[n.wood]:2,[n.stone]:2,[n.food]:5}),savanna:new S("savanna",{[n.cloth]:5,[n.wood]:5,[n.stone]:3,[n.food]:6}),boreal_forest:new S("boreal_forest",{[n.cloth]:4,[n.wood]:10,[n.stone]:3,[n.food]:5}),forest:new S("forest",{[n.cloth]:2,[n.wood]:10,[n.stone]:2,[n.food]:5}),tropical_rainforest:new S("tropical_rainforest",{[n.cloth]:3,[n.wood]:7,[n.stone]:1,[n.food]:5}),cold_swamp:new S("cold_swamp",{[n.cloth]:1,[n.wood]:2,[n.stone]:1,[n.food]:2}),swamp:new S("swamp",{[n.cloth]:1,[n.wood]:1,[n.stone]:0,[n.food]:3}),tropical_swamp:new S("tropical_swamp",{[n.cloth]:1,[n.wood]:3,[n.stone]:1,[n.food]:3}),desert:new S("desert",{[n.cloth]:1,[n.wood]:0,[n.stone]:2,[n.food]:1}),extreme_desert:new S("extreme_desert",{[n.cloth]:0,[n.wood]:0,[n.stone]:1,[n.food]:0})},Ye={[g.freezing]:{[p.arid]:d.tundra,[p.dry]:d.tundra,[p.moderate]:d.tundra,[p.moist]:d.boreal_forest,[p.wet]:d.boreal_forest},[g.cold]:{[p.arid]:d.tundra,[p.dry]:d.tundra,[p.moderate]:d.boreal_forest,[p.moist]:d.boreal_forest,[p.wet]:d.boreal_forest},[g.temperate]:{[p.arid]:d.tundra,[p.dry]:d.forest,[p.moderate]:d.forest,[p.moist]:d.forest,[p.wet]:d.swamp},[g.warm]:{[p.arid]:d.desert,[p.dry]:d.grassland,[p.moderate]:d.savanna,[p.moist]:d.forest,[p.wet]:d.tropical_swamp},[g.hot]:{[p.arid]:d.extreme_desert,[p.dry]:d.desert,[p.moderate]:d.grassland,[p.moist]:d.savanna,[p.wet]:d.tropical_rainforest}};function S(e="",t={},r=1,s=1){return{name:e,resource_production:Object.assign({[n.gold]:0,[n.cloth]:0,[n.wood]:0,[n.stone]:0,[n.iron]:0,[n.food]:0,[n.alcohol]:0},t),movement_speed:r,pleasantness:s}}function he(e){e.forEach(t=>{t.biome=Qe(t)})}function ge(e){e.filter(({elevation:t})=>t===0).forEach(t=>{t.biome=Ke(t)})}function Ke(e,t=b.height){const r=Math.random();return[0,t-1].includes(e.y)?r<=.1?d.sea:d.ice:[1,t-2].includes(e.y)?r<=.75?d.sea:d.ice:[2,t-3].includes(e.y)?r<=.9?d.sea:d.ice:d.sea}function Qe(e){return e.biome?e.biome:e.elevation>1?e.elevation>2?d.high_mountain:d.mountain:Ye[e.temperature][e.humidity]}const Ve=document.getElementById("add-player-btn"),j=document.getElementById("board"),ee=document.getElementById("bottom-bar"),F=document.getElementById("cell-info"),Ge=document.getElementById("cell-debug-info"),R=document.getElementById("cell-production-forecast"),Xe=document.getElementById("toggle-coord-system-btn"),le=document.getElementById("config-game-form"),te=document.getElementById("defs"),ve=document.getElementById("end-turn-btn"),V=document.getElementById("general-info"),K=document.getElementById("overall-production-forecast"),Ze=document.getElementById("phase-label"),J=document.getElementsByClassName("player-config"),je=document.getElementById("player-name"),we=document.getElementById("player-setup"),et=document.getElementById("reroll-map-btn"),tt=document.getElementById("side-bar");document.getElementById("round-info");const G=document.getElementById("season-of-move-select"),re=document.getElementById("selection-highlight"),rt=document.getElementById("start-game-form"),I=document.getElementById("start-game-overlay"),be=document.getElementById("movement-arrows"),A=document.getElementById("movement-config"),T=A.querySelector('[name="troop-strength"]'),Ee=A.querySelector("output"),nt=te.querySelector(".cell-wrapper"),ot=te.querySelector(".movement-indicator"),at=document.createElementNS("http://www.w3.org/2000/svg","path"),st=te.querySelector(".player-border"),ct=document.getElementById("player-config-tmpl").content,it=document.getElementById("structure-builder-tmpl").content,ne={tent:N("Tent",[v(n.wood,1),v(n.cloth,3)],[],0,{on(e){e.housing_capacity+=5},off(e){e.housing_capacity-=5}},[]),textile_factory:N("Textile Factory",[v(n.wood,15),v(n.stone,15)],[v(n.cloth,5)]),lumber_mill:N("Lumber Mill",[v(n.wood,15),v(n.stone,15)],[v(n.wood,5)]),quarry:N("Quarry",[v(n.wood,15),v(n.stone,15)],[v(n.stone,5)]),forge:N("Forge",[v(n.wood,5),v(n.stone,5)],[v(n.iron,1)]),farm:N("Farm",[v(n.wood,5),v(n.stone,5)],[v(n.food,5)]),distillery:N("Distillery",[v(n.wood,5),v(n.stone,5)],[v(n.alcohol,1)])};function N(e="Pretty Structure",t=[v(n.wood,5)],r=[v(n.wood,1)],s=1,o={on(u){u.foo+=5},off(u){u.foo-=5}},a=[d.swamp],c=[v(n.wood,1)],l=1){return{display_name:e,construction_cost:t,space_requirement:l,unsupported_biomes:a,effects:o,output:r,input:c,required_workers:s}}function v(e=n.wood,t=1){return{resource_name:e,amount:t}}function Se(e,t,r,s,o,a,c){const l=lt(e,t,r,s,o,a,c),u=l.querySelector(".population-size");let i=null,m=-1,h=0;return{cx:e,cy:t,x:r,y:s,q:o,r:a,s:c,neighbors:[],cell:l,elevation:0,humidity:p.arid,temperature:g.freezing,structures:new Map(Object.values(ne).map(_=>[_,0])),resources:{get[n.people](){return h},set[n.people](_){h=_,u.textContent=h>0?h:""},[n.gold]:0,[n.cloth]:0,[n.wood]:0,[n.stone]:0,[n.iron]:0,[n.food]:0,[n.alcohol]:0},get biome(){return i},set biome(_){i!==null&&l.classList.remove(i.name),_!==null&&l.classList.add(_.name),i=_},get owner_id(){return m},set owner_id(_){m=_,_!==-1&&(l.dataset.owner_id=_)},developable_land:0}}function lt(e,t,r,s,o,a,c){const l=nt.cloneNode(!0);return l.setAttribute("transform",`translate(${e}, ${t})`),l.querySelector(".q-coord").textContent=o,l.querySelector(".r-coord").textContent=a,l.querySelector(".s-coord").textContent=c,l.querySelector(".offset-coords").textContent=`${r}, ${s}`,j.prepend(l),l}function Le(e){const t=[...e.values()];return t.forEach(r=>Object.assign(r,{biome:null,elevation:0,humidity:p.arid,temperature:g.freezing,resources:Object.keys(r.resources).reduce((s,o)=>(s[o]=0,s),r.resources),owner_id:-1})),pe(t),fe(t),ge(t),ye(t),he(t),e}function ut(e,t){const r=e.map(({cx:s,cy:o,x:a,y:c,q:l,r:u,s:i,biome_name:m,elevation:h,humidity:_,temperature:O,owner_id:y,resources:U})=>{const P=Se(s,o,a,c,l,u,i);return Object.assign(P,{biome:d[m],elevation:h,humidity:_,temperature:O,owner_id:y}),Object.entries(U).forEach(([Ne,ze])=>{P.resources[Ne]=ze}),P});return me(r),$e(r,t)}function dt(e,t){const r=_t(e);return me(r),pe(r),fe(r),ge(r),ye(r),he(r),$e(r,t)}function $e(e,t){return e.reduce((r,s)=>(r.set(s.cell,s),r),t)}function _t({height:e,width:t}){const r=[];for(let s=0;s<e;s+=1){const o=+!Z(s);for(let a=0;a<t;a+=1){const c=a-(s-(s&1))/2;r.push(Se(a*6+o*3,s*4.5,a,s,c,s,-c-s))}}return r}const qe=.5,C=qe*.5;function ke(e,t,r){const s=[];e.reduce((a,c)=>{const l=c.neighbors.filter(y=>!e.includes(y)),u=mt(c),i=pt(c),m=gt(c),h=yt(c),_=ht(c),O=ft(c);return l.find(y=>y.r===c.r&&y.s===c.s+1)&&a.push(`M${h}L${O}`),l.find(y=>y.q===c.q&&y.s===c.s+1)&&a.push(`M${O}L${u}`),l.find(y=>y.s===c.s&&y.r===c.r-1)&&a.push(`M${u}L${_}`),l.find(y=>y.r===c.r&&y.s===c.s-1)&&a.push(`M${_}L${m}`),l.find(y=>y.q===c.q&&y.s===c.s-1)&&a.push(`M${m}L${i}`),l.find(y=>y.s===c.s&&y.r===c.r+1)&&a.push(`M${i}L${h}`),a},s);const o=at.cloneNode(!0);o.setAttribute("d",s.join("")),o.setAttribute("stroke",t),o.setAttribute("stroke-width",qe),r.append(o)}function mt(e){return`${e.cx+3} ${e.cy+C}`}function pt(e){return`${e.cx+3} ${e.cy+6-C}`}function ft(e){return`${e.cx+C} ${e.cy+1.5+C*.5}`}function yt(e){return`${e.cx+C} ${e.cy+4.5-C*.5}`}function ht(e){return`${e.cx+6-C} ${e.cy+1.5+C*.5}`}function gt(e){return`${e.cx+6-C} ${e.cy+4.5-C*.5}`}const vt={human:"human",ai:"ai"};function Oe(e){const t=ct.cloneNode(!0);Object.assign(t.querySelector(".player-name-input"),{name:`player-${e}-name`,value:`Player ${e}`}),t.querySelectorAll(".player-type-select-radio").forEach(r=>{r.name=`player-${e}-type`}),we.append(t)}function oe(e,t="Player Name",r=vt.ai){const s=[],o=st.cloneNode(!0);return document.getElementById("player-borders").append(o),{name:t,type:r,get resources(){return s.reduce((a,{resources:c})=>(Object.entries(c).forEach(([l,u])=>{a[l]+=u}),a),{[n.people]:0,[n.gold]:0,[n.cloth]:0,[n.wood]:0,[n.stone]:0,[n.iron]:0,[n.food]:0,[n.alcohol]:0})},border_path_container:o,get cells(){return s},set cells(a){s.push(...a),ke(s,`var(--player-${e+1})`,o)},encampments:new Map,destroy(){s.length=0,o.remove()}}}function Ie(e,t){K.querySelector("ul").replaceChildren(...ae(e)),K.querySelector("input").value=t,K.classList.remove("hidden")}function wt(e,t){R.querySelector("ul").replaceChildren(...ae(e)),R.querySelector("fieldset").replaceChildren(...t),R.classList.remove("hidden")}function bt(e,{wood:t,stone:r,cloth:s,food:o}){const a=Object.values(ne).filter(c=>!c.unsupported_biomes.includes(e.biome)).map(({display_name:c})=>`<li>${c}</li>`).join("");F.innerHTML=`
        <h2>Cell Info</h2>
        <div>Biome: ${e.biome.name}</div>
        <div>Movement modifier: ${e.biome.movement_speed}</div>
        <div>Pleasantness: ${e.biome.pleasantness}</div>
        ...
        <h3>Production</h3>
        <div>Wood: ${t}</div>
        <div>Stone: ${r}</div>
        <div>Cloth: ${s}</div>
        <div>Food: ${o}</div>
        <h3>Supported structures</h3>
        <ul>${a}</ul>
    `,F.classList.remove("hidden")}function ae(e){return Object.entries(e).map(([t,r])=>Object.assign(document.createElement("li"),{textContent:`${t}: ${r}`}))}function Et(e){return Object.entries(ne).filter(([,t])=>!t.unsupported_biomes.includes(e.biome)).map(([t,r])=>{const s=it.cloneNode(!0).lastElementChild,o=s.querySelector(".label-text"),a=s.querySelector(".structure-count");return s.dataset.structure_name=t,o.textContent=`${r.display_name}: `,a.textContent=e.structures.get(r),s.addEventListener("click",({target:c})=>{const l=c.closest("button");if(l===null)return;const u=l.classList.contains("construct-structure-btn"),i=r.construction_cost;let m=e.structures.get(r);if(u){if(e.developable_land<r.space_requirement||i.some(({resource_name:_,amount:O})=>O>f.active_player.resources[_]))return;m+=1,i.forEach(({resource_name:_,amount:O})=>{let y=O;for(const U of f.active_player.cells){const P=U.resources[_];if(P<y){y-=P,U.resources[_]=0;continue}else U.resources[_]-=y,y=0;if(y===0)break}}),e.developable_land-=r.space_requirement}else{if(m===0)return;m-=1,i.forEach(({resource_name:h,amount:_})=>{e.resources[h]+=_}),e.developable_land+=r.space_requirement}e.structures.set(r,m),a.textContent=m,R.querySelector("ul").replaceChildren(...ae(D([e],f.active_player.tax_rate))),f.update_resource_display()}),s})}function St(e){return({target:t})=>{const r=Number(t.value);t.name==="tax_rate"&&(e.active_player.tax_rate=r)}}let z=null;function Lt(e){e.owner_id===-1&&e.biome!==d.sea?(z=e,ke([...e.neighbors,e],"white",re),V.classList.add("hidden"),bt(e,e.biome.resource_production)):(F.classList.add("hidden"),V.classList.remove("hidden"))}function $t(e){z!==null&&(Object.entries(We).forEach(([t,r])=>{z.resources[t]=r}),z.owner_id=e.current_player_id,e.active_player.cells=[z],z.cell.classList.remove("clicked"),z=null)}function qt(e,t){e.owner_id===t.current_player_id?(K.classList.add("hidden"),wt(D([e],t.active_player.tax_rate),Et(e))):(R.classList.add("hidden"),Ie(D(t.active_player.cells,t.active_player.tax_rate),t.active_player.tax_rate))}const w=[];function kt(){localStorage.setItem("wargame-planned-moves",JSON.stringify(w.map(e=>e.map(({origin:t,target:r,units:s,season:o})=>({origin:{cx:t.cx,cy:t.cy},target:{cx:r.cx,cy:r.cy},units:s,season:o})))))}function Ot(e){const t=JSON.parse(localStorage.getItem("wargame-planned-moves")),r=[...e.board.values()];t.forEach(s=>{w.push(s.map(({origin:o,target:a,units:c,season:l})=>Ce(r.find(({cx:u,cy:i})=>u===o.cx&&i===o.cy),r.find(({cx:u,cy:i})=>u===a.cx&&i===a.cy),c,l)))})}function Ce(e,t,r,s){const o=It(e,t,r);return{season:s,origin:e,target:t,units:r,arrow:o}}function It(e,t,r){const o={x:e.cx+3,y:e.cy+3},a={x:t.cx+3,y:t.cy+3},c=`M${o.x} ${o.y}A 3 3 0 0 0 ${a.x} ${a.y}`,l=ot.cloneNode(!0),u=l.lastElementChild.lastElementChild;return l.firstElementChild.setAttribute("d",c),u.setAttribute("path",c),u.textContent=r,be.append(l),l}const L={spring:"spring",summer:"summer",autumn:"autumn",winter:"winter"};function Ct(e){switch(e){case L.spring:return L.summer;case L.summer:return L.autumn;case L.autumn:return L.winter}}function Q(e,t){return!(t===e||e===L.winter||e===L.summer&&t===L.spring||e===L.autumn&&t!==L.winter)}let E,M;function Bt(e,t){if(E===null){const u=e.owner_id===t.current_player_id&&e.resources[n.people]>1,i=w[t.current_player_id].find(({origin:_})=>_===e),m=w[t.current_player_id].find(({target:_,season:O})=>_===e&&O!=="winter"),h=t.active_player.encampments.has(e);u||i||m||h?E=e:e.cell.classList.remove("clicked");return}if(e.cell.classList.remove("clicked"),E===e){E=null;return}if(!e.neighbors.includes(E))return;M=e;const r=w[t.current_player_id].find(({origin:u,target:i})=>u===E&&i===M),s=E.owner_id===t.current_player_id;let o,a,c,l=L.spring;if(Object.values(L).forEach(u=>{G.querySelector(`input[value="${u}"]`).disabled=!1}),r)o=r.units,l=r.season,c=w[t.current_player_id].filter(({season:u,origin:i})=>Q(r.season,u)&&r.target===i).reduce((u,{season:i,origin:m,units:h})=>(x(w[t.current_player_id],m,i,m.owner_id===t.current_player_id?m.resources[n.people]:0)-r.units<h&&(u+=h),u),0),s?a=x(w[t.current_player_id],E,l,E.resources[n.people])-1:a=x(w[t.current_player_id],E,l);else if(o=0,c=0,s)a=x(w[t.current_player_id],E,l,E.resources[n.people])-1;else{const u=w[t.current_player_id].filter(({target:i})=>i===E).reduce((i,{season:m})=>((i===""||Q(m,i))&&(i=m),i),"");if(u===L.winter){M=null;return}Object.values(L).filter(i=>i===u||Q(i,u)).forEach(i=>{G.querySelector(`input[value="${i}"]`).disabled=!0}),l=Ct(u),a=x(w[t.current_player_id],E,l)}if(a<=0){M=null;return}G.querySelector(`input[value="${l}"]`).checked=!0,T.value=o,Ee.value=o,T.max=a,T.min=c,A.showModal()}function x(e,t,r,s=0){return e.filter(({origin:o,target:a,season:c})=>(o===t||a===t)&&(c===r||Q(c,r))).reduce((o,a)=>(t===a.target?o+=a.units:o-=a.units,o),s)}function Mt(e){return()=>{const t=A.querySelector('[name="season-of-move"]:checked').value,r=Number(T.value),s=w[e.current_player_id].findIndex(({origin:o,target:a})=>o===E&&a===M);if(Number.isNaN(r)||r<=0){if(E=null,M=null,s>-1){const[{arrow:o}]=w[e.current_player_id].splice(s,1);o.remove()}return}if(s>-1){const o=w[e.current_player_id][s];o.units=r,o.arrow.lastElementChild.lastElementChild.textContent=r}else w[e.current_player_id].push(Ce(E,M,r,t));E=null,M=null}}const k={land_grab:H("land_grab","Pick your origin","Confirm choice",Lt),development:H("development","Distribute your wealth",void 0,qt),movement_planning:H("movement_planning","Make your moves",void 0,Bt),movement_execution:H("movement_execution","See what you have done")};function Nt(e){return()=>{e.current_phase===k.land_grab.name&&$t(e),e.next_turn()}}function H(e="round_phase",t=e,r="End turn",s=(o,a)=>{}){return{name:e,call_to_action:t,end_turn_btn_label:r,handle_click_on_cell:s}}const $=[];let X=0,B=k.land_grab.name,q=0,Be=null;const f={board:new Map,get round(){return X},set round(e){X=e},get active_player(){return $[q]},get players(){return $},set players(e){$.push(...e)},get current_player_id(){return q},set current_player_id(e){q=e},get current_player_total_production(){return Be},clear_players(){$.forEach(e=>e.destroy()),$.length=0},get current_phase(){return B},set current_phase(e){B=e},update_resource_display:Me,next_turn(){re.replaceChildren(),q===$.length-1?(q=0,B=(()=>{switch(B){case k.development.name:return w.length=0,$.forEach(()=>w.push([])),k.movement_planning.name;case k.movement_planning.name:return k.movement_execution.name;default:return X+=1,k.development.name}})()):q+=1,ue()},run:ue};function ue(){ve.textContent=k[B].end_turn_btn_label,Ze.textContent=k[B].call_to_action,je.textContent=$[q].name,document.body.dataset.current_phase=k[B].name,document.documentElement.style.setProperty("--active-player-color",`var(--player-${q+1}`),B===k.land_grab.name&&(F.classList.add("hidden"),V.classList.remove("hidden")),B===k.development.name?(F.classList.add("hidden"),V.classList.add("hidden"),Be=D($[q].cells,$[q].tax_rate),R.classList.add("hidden"),Ie(D($[q].cells,$[q].tax_rate),$[q].tax_rate),ee.classList.remove("content-hidden"),Me()):ee.classList.add("content-hidden")}function Me(){ee.replaceChildren(...Object.entries($[q].resources).map(([e,t])=>Object.assign(document.createElement("div"),{textContent:`${e}: ${t}`})))}function zt(){if(f.players.length===0){localStorage.removeItem("wargame-savegame");return}localStorage.setItem("wargame-savegame",JSON.stringify({round:f.round,current_phase:f.current_phase,current_player_id:f.current_player_id,players:f.players.map(({name:e,type:t})=>({name:e,type:t})),board:[...f.board.values()].map(({cx:e,cy:t,x:r,y:s,q:o,r:a,s:c,biome:{name:l},elevation:u,humidity:i,temperature:m,owner_id:h,resources:_})=>({cx:e,cy:t,x:r,y:s,q:o,r:a,s:c,biome_name:l,elevation:u,humidity:i,temperature:m,owner_id:h,resources:_}))}))}function At(e,t){const r=JSON.parse(t);Object.assign(e,{round:r.round,current_phase:r.current_phase,current_player_id:r.current_player_id,players:r.players.map(({name:s,type:o},a)=>oe(a,s,o)),board:ut(r.board,e.board)}),e.players.forEach((s,o)=>{s.cells=[...e.board.values()].filter(a=>a.owner_id===o)})}window.addEventListener("DOMContentLoaded",()=>{const e=localStorage.getItem("wargame-savegame"),t=e!==null;I.dataset.priorSave=t,I.showModal(),t?At(f,e):f.board=dt(b,f.board),Ot(f)},{once:!0});document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&(zt(),kt())});I.addEventListener("cancel",_e);document.addEventListener("submit",_e);T.addEventListener("input",()=>{Ee.value=T.value});rt.addEventListener("submit",e=>{e.submitter.id==="continue-btn"?I.dataset.priorSave==="true"&&I.close():e.submitter.id==="new-game-btn"&&(I.dataset.priorSave==="true"&&(Object.assign(f,{round:0,current_phase:k.land_grab.name,current_player_id:0}),f.board=Le(f.board),f.clear_players(),w.length=0,be.replaceChildren()),Array.from({length:2},(t,r)=>Oe(r+1)),I.classList.add("game-config"))});I.addEventListener("close",()=>{I.dataset.priorSave==="false"&&f.players.length===0&&(f.players=Array.from({length:2},(e,t)=>oe(t,`Player ${t+1}`,"human"))),f.run()});et.addEventListener("click",()=>{f.board=Le(f.board)});ve.addEventListener("click",Nt(f));le.addEventListener("submit",()=>{const e=new Set,t=[...le.querySelectorAll(".player-name-input")];if(t.reduce((r,{value:s})=>(r[s]=s in r?r[s]+1:1,r[s]>1&&e.add(s),r),{}),e.size>0){t.forEach(r=>{e.has(r.value)&&r.classList.add("invalid")});return}f.players=Array.from(J,(r,s)=>{const o=r.querySelector(".player-name-input").value,a=r.querySelector(".player-type-select-radio:checked").value;return oe(s,o,a)}),I.close()});Ve.addEventListener("click",()=>{J.length!==5&&Oe(J.length+1)});we.addEventListener("click",({target:e})=>{e.closest(".delete-player-btn")&&J.length!==2&&(e.closest(".player-config").remove(),[...J].forEach((t,r)=>{r=r+1,Object.assign(t.querySelector(".player-name-input"),{name:`player-${r}-name`,value:`Player ${r}`}),t.querySelectorAll(".player-type-select-radio").forEach(s=>{s.name=`player-${r}-type`})}))});j.addEventListener("click",({target:e})=>{const t=e.closest(".cell-wrapper");if(!t)return;const r=j.querySelector(".clicked"),s=f.board.get(t);r&&(r.classList.remove("clicked"),re.replaceChildren()),r!==t&&t.classList.add("clicked"),Pt(s),k[f.current_phase].handle_click_on_cell(s,f)});tt.addEventListener("input",St(f));A.addEventListener("close",Mt(f));A.addEventListener("submit",()=>{A.close()});document.querySelector("h1").addEventListener("dblclick",()=>{document.body.classList.toggle("debug")});Xe.addEventListener("click",()=>{document.body.classList.toggle("use-offset-coords")});function Pt(e){Ge.textContent=JSON.stringify(e,(t,r)=>t==="neighbors"?void 0:r,4)}
