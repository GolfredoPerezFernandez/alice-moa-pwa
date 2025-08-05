import{r as de,c as L,i as h,u as b,b as F,d as e,e as d,S as _e,f as _,g as C,h as be,j as It,k as n,L as S,F as Pe,l as k,m as ge,n as v,o as pe,p as ve,s as N,q as B,t as Se,w as D,x as Ve}from"./q-eb20b1ef.js";import{ChatOpenAI as Ae}from"@langchain/openai";import{SystemMessage as G,HumanMessage as xe,AIMessage as Ie}from"@langchain/core/messages";import{createClient as Rt}from"@libsql/client";import Mt from"country-flag-icons/string/3x2/US";import Lt from"country-flag-icons/string/3x2/ES";import $t from"country-flag-icons/string/3x2/IT";import Ot from"country-flag-icons/string/3x2/FR";import Pt from"country-flag-icons/string/3x2/BR";function qe(t){return new TextEncoder().encode(t)}function Ce(t){return Array.from(new Uint8Array(t)).map(l=>l.toString(16).padStart(2,"0")).join("")}async function Ut(t){console.log("[AUTH] Hashing password");const l=qe(t),a=crypto.getRandomValues(new Uint8Array(16)),o=await crypto.subtle.importKey("raw",l,{name:"PBKDF2"},!1,["deriveBits"]),s=await crypto.subtle.deriveBits({name:"PBKDF2",salt:a,iterations:1e5,hash:"SHA-256"},o,256),r=new Uint8Array(a.length+32);r.set(a),r.set(new Uint8Array(s),a.length);const i=Ce(r);return console.log("[AUTH] Password hashed successfully"),i}async function jt(t,l){console.log("[AUTH] Verifying password");const a=new Uint8Array(l.match(/.{1,2}/g).map(p=>parseInt(p,16))),o=a.slice(0,16),s=a.slice(16),r=qe(t),i=await crypto.subtle.importKey("raw",r,{name:"PBKDF2"},!1,["deriveBits"]),c=await crypto.subtle.deriveBits({name:"PBKDF2",salt:o,iterations:1e5,hash:"SHA-256"},i,256),g=Ce(c)===Ce(s);return console.log(`[AUTH] Password verification result: ${g}`),g}const Ye=(t,l,a)=>{const o=String(l),s=86400;t.cookie.set("auth_token",o,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:s}),t.cookie.set("user_type",a,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:s}),t.cookie.set("session_active","true",{path:"/",httpOnly:!1,sameSite:"lax",secure:!0,maxAge:s})},Qe=t=>{t.cookie.delete("auth_token",{path:"/"}),t.cookie.delete("user_type",{path:"/"}),t.cookie.delete("session_active",{path:"/"})},ke=t=>{var a;const l=(a=t.cookie.get("auth_token"))==null?void 0:a.value;return console.log(`[AUTH] Retrieved user_id: ${l||"none"}`),l||null},Ke=async t=>{var a;console.log("[AUTH] Verifying authentication");const l=(a=t.cookie.get("auth_token"))==null?void 0:a.value;return console.log(`[AUTH] Found auth_token: ${l?"yes":"no"}`),l?(console.log("[AUTH] User authenticated successfully"),!0):(console.log("[AUTH] No auth_token found - user not authenticated"),!1)},Dt=async t=>{const l=await Ke(t);if(l&&!t.pathname.includes("/auth/logout"))throw t.redirect(302,"/");return{isAuthenticated:l}},Nt=de(h(Dt,"s_xckjbOj1HPc")),Bt=()=>{const t=b(!1);return F(_("s_xhcLYhTye5s",[t])),e("div",{class:`min-h-screen font-sans ${t.value?"dark bg-gradient-to-br from-teal-900 via-green-900 to-gray-900 text-gray-100":"bg-gradient-to-br from-teal-50 via-green-50 to-gray-50 text-gray-900"}`},{style:{paddingTop:"calc(env(safe-area-inset-top))"}},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden opacity-40 z-0"},[" ",e("div",null,{class:"w-20 h-20 bg-teal-500/10 dark:bg-teal-400/10 rounded-full absolute top-[15%] left-[55%] animate-[float_15s_infinite]"},null,3,null),e("div",null,{class:"w-32 h-32 bg-green-500/10 dark:bg-green-400/10 rounded-full absolute top-[40%] left-[75%] animate-[float_18s_infinite]",style:"animation-delay: 0.5s;"},null,3,null),e("div",null,{class:"w-16 h-16 bg-teal-600/10 dark:bg-teal-500/10 rounded-full absolute top-[70%] left-[65%] animate-[float_12s_infinite]",style:"animation-delay: 1s;"},null,3,null),e("div",null,{class:"w-24 h-24 bg-green-600/10 dark:bg-green-500/10 rounded-full absolute top-[30%] left-[40%] animate-[float_20s_infinite]",style:"animation-delay: 1.5s;"},null,3,null)],3,null),e("div",null,{class:"relative z-10 pt-safe"},d(_e,null,3,"9u_0"),1,null),e("style",null,null,`
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -15px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 15px); }
          100% { transform: translate(0, 0); }
        }
      `,3,null)],1,"9u_1")},Ft=L(h(Bt,"s_nNgqqIoeIss")),zt=Object.freeze(Object.defineProperty({__proto__:null,default:Ft,useAuthCheck:Nt},Symbol.toStringTag,{value:"Module"})),Ht=t=>C("svg",{...t,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"8",y2:"12"},null,3,null),e("line",null,{x1:"12",x2:"12.01",y1:"16",y2:"16"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ui_0"),Ue=t=>C("svg",{...t,children:[e("path",null,{d:"m12 19-7-7 7-7"},null,3,null),e("path",null,{d:"M19 12H5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"VY_0"),Re=t=>C("svg",{...t,children:[e("path",null,{d:"M5 12h14"},null,3,null),e("path",null,{d:"m12 5 7 7-7 7"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ye_0"),ie=t=>C("svg",{...t,children:[e("path",null,{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"},null,3,null),e("path",null,{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"uO_0"),Vt=t=>C("svg",{...t,children:[e("rect",null,{height:"18",rx:"2",ry:"2",width:"18",x:"3",y:"4"},null,3,null),e("line",null,{x1:"16",x2:"16",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"8",x2:"8",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"3",x2:"21",y1:"10",y2:"10"},null,3,null),e("path",null,{d:"M8 14h.01"},null,3,null),e("path",null,{d:"M12 14h.01"},null,3,null),e("path",null,{d:"M16 14h.01"},null,3,null),e("path",null,{d:"M8 18h.01"},null,3,null),e("path",null,{d:"M12 18h.01"},null,3,null),e("path",null,{d:"M16 18h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"R5_0"),Z=t=>C("svg",{...t,children:[e("path",null,{d:"M22 10v6M2 10l10-5 10 5-10 5z"},null,3,null),e("path",null,{d:"M6 12v5c3 3 9 3 12 0v-5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Df_0"),qt=t=>C("svg",{...t,children:e("path",null,{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"z9_0"),je=t=>C("svg",{...t,children:[e("path",null,{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},null,3,null),e("polyline",null,{points:"9 22 9 12 15 12 15 22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"pt_0"),Yt=t=>C("svg",{...t,children:[e("path",null,{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"},null,3,null),e("path",null,{d:"M9 18h6"},null,3,null),e("path",null,{d:"M10 22h4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"JJ_0"),me=t=>C("svg",{...t,children:[e("line",null,{x1:"12",x2:"12",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"18",y2:"22"},null,3,null),e("line",null,{x1:"4.93",x2:"7.76",y1:"4.93",y2:"7.76"},null,3,null),e("line",null,{x1:"16.24",x2:"19.07",y1:"16.24",y2:"19.07"},null,3,null),e("line",null,{x1:"2",x2:"6",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"18",x2:"22",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"4.93",x2:"7.76",y1:"19.07",y2:"16.24"},null,3,null),e("line",null,{x1:"16.24",x2:"19.07",y1:"7.76",y2:"4.93"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"kT_0"),De=t=>C("svg",{...t,children:[e("rect",null,{height:"11",rx:"2",ry:"2",width:"18",x:"3",y:"11"},null,3,null),e("path",null,{d:"M7 11V7a5 5 0 0 1 10 0v4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"WS_0"),Ne=t=>C("svg",{...t,children:[e("path",null,{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"},null,3,null),e("polyline",null,{points:"10 17 15 12 10 7"},null,3,null),e("line",null,{x1:"15",x2:"3",y1:"12",y2:"12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"ca_0"),Ee=t=>C("svg",{...t,children:[e("path",null,{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"},null,3,null),e("polyline",null,{points:"16 17 21 12 16 7"},null,3,null),e("line",null,{x1:"21",x2:"9",y1:"12",y2:"12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"0h_0"),Qt=t=>C("svg",{...t,children:[e("rect",null,{height:"16",rx:"2",width:"20",x:"2",y:"4"},null,3,null),e("path",null,{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"n4_0"),Kt=t=>C("svg",{...t,children:[e("line",null,{x1:"4",x2:"20",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"4",x2:"20",y1:"6",y2:"6"},null,3,null),e("line",null,{x1:"4",x2:"20",y1:"18",y2:"18"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"f1_0"),le=t=>C("svg",{...t,children:e("path",null,{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"42_0"),Wt=t=>C("svg",{...t,children:[e("line",null,{x1:"2",x2:"22",y1:"2",y2:"22"},null,3,null),e("path",null,{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"},null,3,null),e("path",null,{d:"M5 10v2a7 7 0 0 0 12 5"},null,3,null),e("path",null,{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33"},null,3,null),e("path",null,{d:"M9 9v3a3 3 0 0 0 5.12 2.12"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"19",y2:"22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Vn_0"),Xt=t=>C("svg",{...t,children:[e("path",null,{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"},null,3,null),e("path",null,{d:"M19 10v2a7 7 0 0 1-14 0v-2"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"19",y2:"22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"xC_0"),Be=t=>C("svg",{...t,children:e("path",null,{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Oe_0"),We=t=>C("svg",{...t,children:[e("path",null,{d:"m22 2-7 20-4-9-9-4Z"},null,3,null),e("path",null,{d:"M22 2 11 13"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ll_0"),Gt=t=>C("svg",{...t,children:[e("path",null,{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"},null,3,null),e("path",null,{d:"M5 3v4"},null,3,null),e("path",null,{d:"M19 17v4"},null,3,null),e("path",null,{d:"M3 5h4"},null,3,null),e("path",null,{d:"M17 19h4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"61_0"),Fe=t=>C("svg",{...t,children:[e("circle",null,{cx:"12",cy:"12",r:"4"},null,3,null),e("path",null,{d:"M12 2v2"},null,3,null),e("path",null,{d:"M12 20v2"},null,3,null),e("path",null,{d:"m4.93 4.93 1.41 1.41"},null,3,null),e("path",null,{d:"m17.66 17.66 1.41 1.41"},null,3,null),e("path",null,{d:"M2 12h2"},null,3,null),e("path",null,{d:"M20 12h2"},null,3,null),e("path",null,{d:"m6.34 17.66-1.41 1.41"},null,3,null),e("path",null,{d:"m19.07 4.93-1.41 1.41"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Qm_0"),Zt=t=>C("svg",{...t,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"6"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"t5_0"),Jt=t=>C("svg",{...t,children:[e("path",null,{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"12",cy:"7",r:"4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sX_0"),ce=t=>C("svg",{...t,children:[e("path",null,{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"9",cy:"7",r:"4"},null,3,null),e("path",null,{d:"M22 21v-2a4 4 0 0 0-3-3.87"},null,3,null),e("path",null,{d:"M16 3.13a4 4 0 0 1 0 7.75"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"pI_0"),el=t=>C("svg",{...t,children:[e("polygon",null,{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"},null,3,null),e("path",null,{d:"M15.54 8.46a5 5 0 0 1 0 7.07"},null,3,null),e("path",null,{d:"M19.07 4.93a10 10 0 0 1 0 14.14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"0H_0"),tl=t=>C("svg",{...t,children:[e("polygon",null,{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"},null,3,null),e("line",null,{x1:"22",x2:"16",y1:"9",y2:"15"},null,3,null),e("line",null,{x1:"16",x2:"22",y1:"9",y2:"15"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"gs_0"),ll=t=>C("svg",{...t,children:[e("path",null,{d:"M18 6 6 18"},null,3,null),e("path",null,{d:"m6 6 12 12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"CN_0"),nl=async t=>{console.log("[Layout Loader] Starting auth check");try{const l=await Ke(t);return console.log(`[Layout Loader] Is Authenticated: ${l}`),{isAuthenticated:l}}catch(l){return console.error("[Layout Loader] Error checking auth:",l),{user_id:null,isAuthenticated:!1}}},Xe=de(h(nl,"s_I1dLegD8h0k")),al=()=>{const[t]=k();t.value=!t.value,t.value?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")},rl=()=>{const[t]=k();return t.value=!1},sl=()=>{const[t]=k();return t.value=!1},ol=()=>{const[t]=k();return t.value=!1},il=()=>{const[t]=k();return t.value=!1},cl=()=>{const[t]=k();return t.value=!1},ul=()=>{const[t]=k();return t.value=!1},dl=()=>{const[t]=k();return t.value=!1},gl=()=>{var c,g,p,u;be();const t=Xe(),l=It(),a=b(!1),o=b(!1),s=b(!1),r=m=>l.url.pathname.startsWith(m);F(_("s_c6Pb49uSSiw",[a,s,l]));const i=h(al,"s_0whHyN0kxrI",[a]);return l.url.pathname.startsWith("/auth")?d(_e,null,3,"as_0"):(F(_("s_70w0lA9O1OU",[s,l])),F(_("s_io02Bdne6Z4",[t])),e("div",null,{class:"min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"},[e("header",null,{class:"sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"},e("div",null,{class:"container mx-auto px-4 flex justify-between items-center h-16"},[e("div",null,{class:"flex items-center"},d(S,{href:"/",class:"flex items-center group",children:[e("div",null,{class:"w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform"},[d(Z,{class:"w-5 h-5",[n]:{class:n}},3,"as_1")," "],1,null),e("span",null,{class:"ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400"},"Move On Academy",3,null)],[n]:{href:n,class:n}},1,"as_2"),1,null),e("nav",null,{class:"hidden md:flex items-center space-x-1"},[d(S,{href:"/",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${l.url.pathname==="/"?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[d(je,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_3"),e("span",null,null,"Home",3,null)],1,null),[n]:{href:n}},1,"as_4"),d(S,{href:"/courses",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${r("/courses")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[d(ie,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_5"),e("span",null,null,"Courses",3,null)],1,null),[n]:{href:n}},1,"as_6"),d(S,{href:"/about",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${r("/about")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[d(ce,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_7"),e("span",null,null,"About",3,null)],1,null),[n]:{href:n}},1,"as_8"),((c=t.value)==null?void 0:c.isAuthenticated)&&d(Pe,{children:[d(S,{href:"/chat",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${r("/chat")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[d(le,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_9")," ",e("span",null,null,"Chat",3,null)],1,null),[n]:{href:n}},1,"as_10"),d(S,{href:"/text-chat",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${r("/text-chat")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[d(le,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_11"),e("span",null,null,"Text Chat",3,null)],1,null),[n]:{href:n}},1,"as_12"),d(S,{href:"/auth/logout",class:"px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors",children:e("div",null,{class:"flex items-center"},[d(Ee,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_13"),e("span",null,null,"Logout",3,null)],1,null),[n]:{href:n,class:n}},1,"as_14")]},1,"as_15"),!((g=t.value)!=null&&g.isAuthenticated)&&d(S,{href:"/auth",class:"px-3 py-2 rounded-md text-sm font-medium text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30 transition-colors",children:e("div",null,{class:"flex items-center"},[d(Ne,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_16")," ",e("span",null,null,"Login / Sign Up",3,null)],1,null),[n]:{href:n,class:n}},1,"as_17"),e("button",null,{class:"ml-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors","aria-label":"Toggle Dark Mode",onClick$:i},a.value?d(Fe,{class:"w-5 h-5",[n]:{class:n}},3,"as_18"):d(Be,{class:"w-5 h-5",[n]:{class:n}},3,"as_19"),1,null)],1,null),e("div",null,{class:"flex items-center md:hidden"},[e("button",null,{class:"p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 focus:outline-none","aria-label":"Toggle Menu",onClick$:_("s_a0eSFtWPV0I",[o])},o.value?d(ll,{class:"w-6 h-6",[n]:{class:n}},3,"as_20"):d(Kt,{class:"w-6 h-6",[n]:{class:n}},3,"as_21"),1,null),e("button",null,{class:"ml-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors","aria-label":"Toggle Dark Mode",onClick$:i},a.value?d(Fe,{class:"w-5 h-5",[n]:{class:n}},3,"as_22"):d(Be,{class:"w-5 h-5",[n]:{class:n}},3,"as_23"),1,null)],1,null)],1,null),1,null),o.value&&e("div",null,{class:"md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md animate-slideDown"},e("div",null,{class:"px-2 pt-2 pb-3 space-y-1"},[d(S,{href:"/",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${l.url.pathname==="/"?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:h(rl,"s_bcoLfcxcKec",[o]),children:e("div",null,{class:"flex items-center"},[d(je,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_24"),e("span",null,null,"Home",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_25"),d(S,{href:"/courses",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${r("/courses")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:h(sl,"s_hhWSyA6Pzn0",[o]),children:e("div",null,{class:"flex items-center"},[d(ie,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_26"),e("span",null,null,"Courses",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_27"),d(S,{href:"/about",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${r("/about")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:h(ol,"s_PgppD3zDhYc",[o]),children:e("div",null,{class:"flex items-center"},[d(ce,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_28"),e("span",null,null,"About",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_29"),((p=t.value)==null?void 0:p.isAuthenticated)&&d(Pe,{children:[d(S,{href:"/chat",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${r("/chat")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:h(il,"s_sP0ivQGS40I",[o]),children:e("div",null,{class:"flex items-center"},[d(le,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_30"),e("span",null,null,"Chat",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_31"),d(S,{href:"/text-chat",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${r("/text-chat")?"bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:h(cl,"s_WWUKJMPJgBU",[o]),children:e("div",null,{class:"flex items-center"},[d(le,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_32"),e("span",null,null,"Text Chat",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_33"),d(S,{href:"/auth/logout",class:"block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors",onClick$:h(ul,"s_ms2sIVmsuEk",[o]),children:e("div",null,{class:"flex items-center"},[d(Ee,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_34"),e("span",null,null,"Logout",3,null)],1,null),[n]:{href:n,class:n,onClick$:n}},1,"as_35")]},1,"as_36"),!((u=t.value)!=null&&u.isAuthenticated)&&d(S,{href:"/auth",class:"block px-3 py-2 rounded-md text-base font-medium text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30 transition-colors",onClick$:h(dl,"s_ITpEgQ01eVw",[o]),children:e("div",null,{class:"flex items-center"},[d(Ne,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_37")," ",e("span",null,null,"Login / Sign Up",3,null)],1,null),[n]:{href:n,class:n,onClick$:n}},1,"as_38")],1,null),1,"as_39"),e("main",null,{class:"container mx-auto py-4 px-4 md:px-6"},d(_e,null,3,"as_40"),1,null),!l.url.pathname.startsWith("/chat")&&!l.url.pathname.startsWith("/text-chat")&&e("footer",null,{class:"bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto"},e("div",null,{class:"container mx-auto px-4"},e("div",null,{class:"flex flex-col md:flex-row justify-between items-center"},[e("div",null,{class:"flex items-center mb-4 md:mb-0"},[e("div",null,{class:"w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white shadow"},d(Z,{class:"w-5 h-5",[n]:{class:n}},3,"as_41"),1,null),e("span",null,{class:"ml-2 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400"},"Move On Academy",3,null)],1,null),e("div",null,{class:"text-center md:text-right text-sm text-gray-600 dark:text-gray-400"},[e("p",null,null,["© ",new Date().getFullYear()," Move On Academy. All rights reserved."],1,null),e("div",null,{class:"mt-2 space-x-4"},[d(S,{href:"/terms",class:"hover:text-teal-600 dark:hover:text-teal-400",children:"Terms",[n]:{href:n,class:n}},3,"as_42"),d(S,{href:"/privacy",class:"hover:text-teal-600 dark:hover:text-teal-400",children:"Privacy",[n]:{href:n,class:n}},3,"as_43"),d(S,{href:"/contact",class:"hover:text-teal-600 dark:hover:text-teal-400",children:"Contact",[n]:{href:n,class:n}},3,"as_44")],1,null)],1,null)],1,null),1,null),1,"as_45"),e("style",null,null,`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        /* Hide scrollbars but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        
        html, body {
          overscroll-behavior: none;
        }
      `,3,null)],1,"as_46"))},pl=L(h(gl,"s_08vswLB0CwY")),ml=Object.freeze(Object.defineProperty({__proto__:null,default:pl,useLayoutAuthLoader:Xe},Symbol.toStringTag,{value:"Module"})),hl=()=>e("div",null,{class:"flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900"},[e("section",null,{class:"relative py-16 lg:py-20 px-4 sm:px-6 overflow-hidden"},[e("div",null,{class:"absolute inset-0 pointer-events-none overflow-hidden"},e("div",null,{class:"absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-100/60 to-green-50/30 dark:from-teal-900/30 dark:to-green-900/10"},null,3,null),3,null),e("div",null,{class:"max-w-7xl mx-auto relative px-2 sm:px-4"},e("div",null,{class:"flex flex-col sm:flex-row items-center gap-6 w-full"},[e("div",null,{class:"w-full sm:w-auto max-w-xs mx-auto sm:mx-0 order-2 sm:order-1"},e("div",null,{class:"rounded-lg overflow-hidden shadow-lg border-2 border-teal-200 dark:border-teal-800 aspect-[3/4] sm:aspect-auto bg-gray-100 dark:bg-gray-800"},e("video",null,{autoplay:!0,loop:!0,muted:!0,playsInline:!0,class:"w-full h-full object-cover object-center",style:{maxHeight:"280px"}},[e("source",null,{src:"/prs_alice.idle.mp4",type:"video/mp4"},null,3,null),"Your browser does not support the video tag."],3,null),3,null),3,null),e("div",null,{class:"w-full sm:flex-1 text-center order-1 sm:order-2"},[e("h1",null,{class:"text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight"},[e("span",null,{class:"block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400"},"Move On Academy",3,null),e("span",null,{class:"block mt-1"},"Unlock Your Language Potential",3,null)],3,null),e("p",null,{class:"mt-3 mt-4 mb-4 sm:mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed mx-auto max-w-lg"},"Join our vibrant community and embark on a journey to fluency. Interactive courses, expert instructors, and real-world practice.",3,null),e("div",null,{class:"mt-5 sm:mt-8 flex flex-wrap gap-3 justify-center"},[d(S,{href:"/courses",class:"px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center text-sm sm:text-base",children:["Explore Courses",d(Re,{class:"ml-2 h-4 w-4 sm:h-5 sm:w-5",[n]:{class:n}},3,"k9_0")],[n]:{href:n,class:n}},1,"k9_1"),d(S,{href:"/chat",class:"px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm hover:shadow-md text-sm sm:text-base",children:"Chat with Alice",[n]:{href:n,class:n}},3,"k9_2")],1,null)],1,null)],1,null),1,null)],1,null),e("section",null,{class:"py-12 px-4 sm:px-6 lg:py-16"},e("div",null,{class:"max-w-7xl mx-auto"},[e("div",null,{class:"text-center mb-12"},[e("h2",null,{class:"text-3xl font-bold text-gray-900 dark:text-white"},"Why Choose Move On Academy?",3,null),e("p",null,{class:"mt-4 text-xl text-gray-600 dark:text-gray-300"},"A modern approach to language learning designed for success.",3,null)],3,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 mb-4"},d(ie,{class:"w-6 h-6 text-teal-600 dark:text-teal-400",[n]:{class:n}},3,"k9_3"),1,null),e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-2"},"Interactive Courses",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Engaging lessons designed for all levels, from beginner to advanced.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4"},d(Z,{class:"w-6 h-6 text-green-600 dark:text-green-400",[n]:{class:n}},3,"k9_4"),1,null),e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-2"},"Expert Instructors",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Learn from experienced teachers passionate about language education.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900 mb-4"},d(le,{class:"w-6 h-6 text-cyan-600 dark:text-cyan-400",[n]:{class:n}},3,"k9_5"),1,null),e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-2"},"AI Practice Partner",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Practice conversation anytime with Alice, our intelligent AI tutor.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-lime-100 dark:bg-lime-900 mb-4"},d(ce,{class:"w-6 h-6 text-lime-600 dark:text-lime-400",[n]:{class:n}},3,"k9_6"),1,null),e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-2"},"Supportive Community",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Connect with fellow learners, practice together, and share your progress.",3,null)],1,null)],1,null)],1,null),1,null),e("section",null,{class:"py-12 px-4 sm:px-6 lg:py-16 bg-gradient-to-r from-teal-500 to-green-600 dark:from-teal-800 dark:to-green-900"},e("div",null,{class:"max-w-4xl mx-auto text-center"},[e("h2",null,{class:"text-3xl font-bold text-white"},"Ready to Start Your Language Journey?",3,null),e("p",null,{class:"mt-4 text-xl text-teal-100 dark:text-teal-200"},"Sign up today and take the first step towards mastering a new language.",3,null),e("div",null,{class:"mt-8"},d(S,{href:"/auth",class:"px-8 py-3 rounded-lg bg-white text-teal-600 font-medium transition-colors shadow-lg hover:bg-teal-50",children:"Sign Up Now",[n]:{href:n,class:n}},3,"k9_7"),1,null)],1,null),1,null),e("footer",null,{class:"py-8 px-4 sm:px-6 bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"},e("div",null,{class:"max-w-7xl mx-auto text-center text-gray-500 dark:text-gray-400"},["© ",new Date().getFullYear()," Move On Academy. All rights reserved. |",d(S,{href:"/terms",class:"hover:text-teal-600 dark:hover:text-teal-400 ml-2",children:"Terms",[n]:{href:n,class:n}},3,"k9_8")," |",d(S,{href:"/privacy",class:"hover:text-teal-600 dark:hover:text-teal-400 ml-2",children:"Privacy",[n]:{href:n,class:n}},3,"k9_9")],1,null),1,null)],1,"k9_10"),fl=L(h(hl,"s_0H7JnAEW1p0")),xl={title:"Move On Academy - Learn Languages Effectively",meta:[{name:"description",content:"Join Move On Academy to learn new languages with interactive courses, expert instructors, and an AI practice partner. Start your journey to fluency today!"}]},yl=Object.freeze(Object.defineProperty({__proto__:null,default:fl,head:xl},Symbol.toStringTag,{value:"Module"}));function z(t){var l,a;try{console.log("[TURSO] Creating database client");const o=(l=t.env.get("PRIVATE_TURSO_DATABASE_URL"))==null?void 0:l.trim();if(!o)throw console.error("[TURSO] Missing database URL"),new Error("PRIVATE_TURSO_DATABASE_URL is not defined");const s=(a=t.env.get("PRIVATE_TURSO_AUTH_TOKEN"))==null?void 0:a.trim();if(!s){if(!o.includes("file:"))throw console.error("[TURSO] Missing auth token for remote database"),new Error("PRIVATE_TURSO_AUTH_TOKEN is not defined");console.log("[TURSO] No auth token needed for local database")}return console.log(`[TURSO] Creating client for URL: ${o.substring(0,20)}...`),Rt({url:o,authToken:s})}catch(o){throw console.error("[TURSO] Error creating database client:",o),o}}const Ge=10,bl=async t=>{try{const l=ke(t);if(!l)return t.json({success:!1,error:"Authentication required"},{status:401});const a=await t.request.json(),{message:o,formatResponse:s=!0}=a;if(!o)return t.json({success:!1,error:"Message is required"},{status:400});const r=t.env.get("OPENAI_API_KEY")||{}.OPENAI_API_KEY;if(!r)return t.json({success:!1,error:"OpenAI API key is not configured"},{status:500});const i=z(t),c=await i.execute({sql:`SELECT role, content 
            FROM text_chat_messages 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?`,args:[l,Ge]}),g=[];if(c.rows.length===0){const f=new G("You are Alice, a helpful and friendly AI assistant. You provide clear, concise, and accurate information.");g.push(f),await i.execute({sql:"INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)",args:[l,"system",f.content]})}else for(let f=c.rows.length-1;f>=0;f--){const x=c.rows[f],y=String(x.content||"");x.role==="user"?g.push(new xe(y)):x.role==="assistant"?g.push(new Ie(y)):x.role==="system"&&g.push(new G(y))}g.push(new xe(o)),await i.execute({sql:"INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)",args:[l,"user",o]});const p=new Ae({openAIApiKey:r,modelName:"gpt-4-turbo-preview",temperature:.7});if(s){const f=g.findIndex(x=>x instanceof G);if(f>=0){const x=g[f];g[f]=new G(`${x.content}

Format your responses using Markdown where appropriate: use **double asterisks** around important information, concepts, or key terms to highlight them in bold.`)}else g.unshift(new G("You are Alice, a helpful and friendly AI assistant. You provide clear, concise, and accurate information. Format your responses using Markdown where appropriate: use **double asterisks** around important information, concepts, or key terms to highlight them in bold."))}const u=await p.invoke(g),m=typeof u.content=="string"?u.content:JSON.stringify(u.content);return await i.execute({sql:"INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)",args:[l,"assistant",m]}),t.json({success:!0,message:m})}catch(l){return console.error("Error in chat-text API:",l),t.json({success:!1,error:l instanceof Error?l.message:"Unknown error occurred"},{status:500})}},vl=h(bl,"s_7H78osu0XaI"),kl=Object.freeze(Object.defineProperty({__proto__:null,_auto_MAX_CONTEXT_MESSAGES:Ge,onPost:vl},Symbol.toStringTag,{value:"Module"})),wl=({cookie:t,redirect:l})=>{throw t.delete("auth_token",{path:"/"}),t.delete("user_type",{path:"/"}),l(302,"/auth")},_l=async(t,l)=>{try{console.log("[LOGOUT] Starting logout process"),Qe(l);const a=l.cookie.get("auth_token"),o=l.cookie.get("user_type");if(a||o)throw console.error("[LOGOUT] Cookies not cleared properly:",{authToken:a,userType:o}),new Error("Failed to clear authentication cookies");return console.log("[LOGOUT] Successfully cleared all cookies"),l.redirect(302,"/auth"),{success:!0}}catch(a){return console.error("Logout error:",a),{success:!1,error:a instanceof Error?a.message:"Logout failed"}}},Ze=ge(h(_l,"s_X10g1MGFVho")),Sl=()=>{},Cl=()=>{var a,o;be();const t=Ze(),l=((a=t.value)==null?void 0:a.success)===!1;return e("div",null,{class:"min-h-screen w-full flex items-center justify-center transition-colors duration-300 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-blue-950 py-6 px-4 sm:px-6 lg:px-8 overflow-hidden relative"},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden"},[e("div",null,{class:"w-20 h-20 bg-blue-500/10 rounded-full absolute top-[10%] left-[15%] animate-[float_15s_infinite]"},null,3,null),e("div",null,{class:"w-32 h-32 bg-indigo-500/10 rounded-full absolute top-[30%] left-[65%] animate-[float_18s_infinite]",style:"animation-delay: 0.5s;"},null,3,null),e("div",null,{class:"w-16 h-16 bg-teal-500/10 rounded-full absolute top-[70%] left-[25%] animate-[float_12s_infinite]",style:"animation-delay: 1s;"},null,3,null)],3,null),e("div",null,{class:"absolute top-6 left-1/2 transform -translate-x-1/2"},e("div",null,{class:"flex items-center"},[e("div",null,{class:"relative"},e("div",null,{class:"w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"w-6 h-6"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round",d:"m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"},null,3,null),3,null),3,null),3,null),e("h1",null,{class:"ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"},"Move On Challenge",3,null)],3,null),3,null),e("div",null,{class:"max-w-md w-full z-10"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]"},[e("div",null,{class:"text-center mb-8"},[e("h2",null,{class:"text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"},"Log Out",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-400"},"Are you sure you want to log out?",3,null)],3,null),d(pe,{action:t,class:"space-y-6",spaReset:!0,get"preventdefault:submit"(){return t.isRunning},onSubmitCompleted$:h(Sl,"s_GZ039Xhc9W0"),children:[e("button",null,{type:"submit",disabled:v(s=>s.isRunning,[t],"p0.isRunning"),class:"w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:_("s_CCfP4YxazY4")},t.isRunning?e("span",null,{class:"flex items-center"},[d(me,{class:"animate-spin mr-2 h-5 w-5",[n]:{class:n}},3,"S9_0"),"Logging out..."],1,"S9_1"):e("span",null,{class:"flex items-center"},[d(Ee,{class:"mr-2 h-5 w-5",[n]:{class:n}},3,"S9_2"),"Confirm Logout"],1,null),1,null),l&&e("div",null,{class:"p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm mt-4"},[e("p",null,null,"There was a problem logging you out. Please try again.",3,null),((o=t.value)==null?void 0:o.error)&&e("p",null,{class:"mt-1 text-xs opacity-80"},v(s=>s.value.error,[t],"p0.value.error"),3,"S9_3")],1,"S9_4"),e("a",null,{href:"/marketplace",class:"block w-full text-center mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"},"Cancel",3,null)],[n]:{action:n,class:n,spaReset:n,"preventdefault:submit":v(s=>s.isRunning,[t],"p0.isRunning"),onSubmitCompleted$:n}},1,"S9_5")],1,null),e("div",null,{class:"mt-6 text-center text-sm text-gray-600 dark:text-gray-400"},"Thank you for using Move On Challenge",3,null)],1,null),e("style",null,null,`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -15px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 15px); }
          100% { transform: translate(0, 0); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `,3,null)],1,"S9_6")},El=L(h(Cl,"s_JBiTm0tuWIY")),Tl=Object.freeze(Object.defineProperty({__proto__:null,default:El,onGet:wl,useLogout:Ze},Symbol.toStringTag,{value:"Module"})),Al=`
    .hero {
      /* Updated gradient for Move On Academy */
      background-image: linear-gradient(to right, rgba(13, 148, 136, 0.9), rgba(5, 150, 105, 0.8)), url('/images/language-learning-bg.jpg'); /* Replace with a relevant background image */
      background-size: cover;
      background-position: center;
      color: white;
    }

    .section {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .visible {
      opacity: 1;
      transform: translateY(0);
    }

    .feature-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* Enhanced hover shadow */
    }

    .icon-gradient {
      /* Updated icon background gradient */
      @apply bg-gradient-to-r from-teal-500 to-green-600 p-3 rounded-lg text-white inline-flex shadow-md;
    }

    /* Timeline styling (Optional - can be adapted or removed if not needed for About page) */
    .timeline-container {
      @apply relative;
    }

    .timeline-item {
      @apply relative pl-10 pb-10;
    }

    .timeline-item:before {
      content: '';
      /* Updated timeline color */
      @apply absolute left-3 top-2 h-full w-0.5 bg-teal-200 dark:bg-teal-900;
    }

    .timeline-item:last-child:before {
      @apply h-6;
    }

    .timeline-circle {
      /* Updated timeline circle color */
      @apply absolute left-0 top-2 h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow;
    }
  `,Il=()=>{ve(h(Al,"s_0qQ3k6L1bs0"));const t=[b(),b(),b()];return F(_("s_XQghmw02tBA")),e("div",null,{class:"flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900"},[e("div",null,{class:"hero py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center"},e("div",null,{class:"max-w-4xl text-center"},[e("h1",null,{class:"text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white"},"About Move On Academy",3,null),e("p",null,{class:"text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto"},"Empowering individuals through language education and fostering global understanding with innovative teaching methods.",3,null),e("div",null,{class:"flex flex-col sm:flex-row gap-4 justify-center"},[d(S,{href:"/courses",class:"px-8 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-md",children:"Explore Our Courses",[n]:{href:n,class:n}},3,"iL_0"),d(S,{href:"/contact",class:"px-8 py-3 bg-teal-700 border border-white text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors text-center shadow-md",children:"Get In Touch",[n]:{href:n,class:n}},3,"iL_1")],1,null)],1,null),1,null),e("section",{ref:t[0]},{class:"py-16 px-4 bg-white dark:bg-gray-800 section"},e("div",null,{class:"max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center"},[e("div",null,null,[e("span",null,{class:"inline-block px-3 py-1 text-sm font-semibold text-teal-800 bg-teal-100 dark:bg-teal-900 dark:text-teal-200 rounded-full mb-3"},"Our Purpose",3,null),e("h2",null,{class:"text-3xl font-bold mb-4 text-gray-900 dark:text-white"},"Our Mission & Vision",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-6"},"Move On Academy is dedicated to making language learning accessible, engaging, and effective for everyone. We believe that mastering a new language opens doors to new cultures, opportunities, and personal growth.",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300"},"Our vision is to build a global community of confident communicators, breaking down barriers and fostering connection through the power of language.",3,null)],3,null),e("div",null,{class:"flex justify-center"},d(Zt,{class:"w-48 h-48 text-teal-500 dark:text-teal-400 opacity-80",[n]:{class:n}},3,"iL_2"),1,null)],1,null),1,null),e("section",{ref:t[1]},{class:"py-16 px-4 bg-gray-50 dark:bg-gray-900 section"},e("div",null,{class:"max-w-7xl mx-auto"},[e("h2",null,{class:"text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"},"What We Stand For",3,null),e("div",null,{class:"grid md:grid-cols-2 lg:grid-cols-3 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-teal-500 dark:border-teal-400"},[e("div",null,{class:"icon-gradient mb-4"},d(Z,{class:"w-6 h-6",[n]:{class:n}},3,"iL_3"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Effective Learning",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Utilizing proven teaching methodologies combined with modern technology for optimal results.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-green-500 dark:border-green-400"},[e("div",null,{class:"icon-gradient mb-4"},d(ce,{class:"w-6 h-6",[n]:{class:n}},3,"iL_4"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Supportive Community",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Fostering a welcoming environment where learners can connect, practice, and grow together.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-cyan-500 dark:border-cyan-400"},[e("div",null,{class:"icon-gradient mb-4"},d(qt,{class:"w-6 h-6",[n]:{class:n}},3,"iL_5"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Passion & Respect",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Driven by a love for languages and respect for diverse cultures and individual learning journeys.",3,null)],1,null)],1,null)],1,null),1,null),e("section",{ref:t[2]},{class:"py-16 px-4 bg-white dark:bg-gray-800 section"},e("div",null,{class:"max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center"},[e("div",null,{class:"flex justify-center md:order-last"},d(Yt,{class:"w-48 h-48 text-green-500 dark:text-green-400 opacity-80",[n]:{class:n}},3,"iL_6"),1,null),e("div",null,{class:"md:order-first"},[e("span",null,{class:"inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full mb-3"},"How We Teach",3,null),e("h2",null,{class:"text-3xl font-bold mb-4 text-gray-900 dark:text-white"},"Our Teaching Approach",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-4"},"We blend interactive lessons, real-world scenarios, and cutting-edge AI tools like our chat partner, Alice, to create a dynamic and personalized learning experience.",3,null),e("ul",null,{class:"space-y-3 text-gray-600 dark:text-gray-300"},[e("li",null,{class:"flex items-start"},[d(Gt,{class:"w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0",[n]:{class:n}},3,"iL_7"),e("span",null,null,"Focus on practical communication skills from day one.",3,null)],1,null),e("li",null,{class:"flex items-start"},[d(ie,{class:"w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0",[n]:{class:n}},3,"iL_8"),e("span",null,null,"Curriculum designed for engagement and long-term retention.",3,null)],1,null),e("li",null,{class:"flex items-start"},[d(le,{class:"w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0",[n]:{class:n}},3,"iL_9"),e("span",null,null,"Integration of AI for personalized practice and feedback.",3,null)],1,null)],1,null)],1,null)],1,null),1,null),e("div",null,{class:"py-16 px-4 text-center bg-gray-50 dark:bg-gray-900"},e("div",null,{class:"max-w-3xl mx-auto"},[e("h2",null,{class:"text-3xl font-bold mb-6 text-teal-700 dark:text-teal-300"},"Ready to Begin Your Language Adventure?",3,null),e("p",null,{class:"text-lg mb-8 text-gray-600 dark:text-gray-300"},"Join the Move On Academy community today and discover the joy of learning a new language.",3,null),d(S,{href:"/auth",class:"inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300",children:["Sign Up Now",d(Re,{class:"w-5 h-5 ml-2",[n]:{class:n}},3,"iL_10")],[n]:{href:n,class:n}},1,"iL_11")],1,null),1,null)],1,"iL_12")},Rl=L(h(Il,"s_tPTKrVT0pR0")),Ml={title:"About Move On Academy",meta:[{name:"description",content:"Learn about Move On Academy's mission, values, and innovative approach to language learning. Join our community and start your journey to fluency."}]},Ll=Object.freeze(Object.defineProperty({__proto__:null,default:Rl,head:Ml},Symbol.toStringTag,{value:"Module"}));async function $l(t){console.log("[DB-INIT] Starting database initialization");const l=z(t);try{console.log("[DB-INIT] Using hardcoded auth schema");const o=`
      -- Users Table for Authentication
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          type TEXT DEFAULT 'normal' CHECK (type IN ('admin', 'coordinator', 'normal')),
          name TEXT,
          session_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);

      -- Chat History Table
      CREATE TABLE IF NOT EXISTS chat_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant')), -- Who sent the message
          content TEXT NOT NULL, -- The message text
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Link to users table
      );

      -- Index for faster history retrieval per user
      CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
      
      -- Text Chat Messages Table (for chat without avatar)
      CREATE TABLE IF NOT EXISTS text_chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')), -- Who sent the message
          content TEXT NOT NULL, -- The message text
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Link to users table
      );

      -- Index for faster text chat history retrieval per user
      CREATE INDEX IF NOT EXISTS idx_text_chat_messages_user_id ON text_chat_messages(user_id);
    `.split(";").map(r=>r.trim()).filter(r=>r.length>0);console.log(`[DB-INIT] Executing ${o.length} SQL statements`);for(const r of o)await l.execute(r);const s=await l.batch(["SELECT name FROM sqlite_master WHERE type='table' AND name='users'","SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'"],"read");return s[0].rows.length===0||s[1].rows.length===0?(console.error("[DB-INIT] Verification failed: users or chat_history table not found."),{success:!1,message:"Required tables (users, chat_history) were not created successfully"}):(console.log("[DB-INIT] Database initialized successfully"),{success:!0,message:"Authentication database initialized successfully"})}catch(a){return console.error("[DB-INIT] Error initializing database:",a),{success:!1,message:`Database initialization failed: ${a instanceof Error?a.message:String(a)}`}}}async function Ol(t){console.log("[DB-CHECK] Checking database connection");const l=z(t);try{const a=await l.execute("SELECT 1 as test");return a.rows&&a.rows.length>0?(console.log("[DB-CHECK] Database connection successful"),{connected:!0,message:"Database connection successful"}):(console.error("[DB-CHECK] Database connection failed: No rows returned"),{connected:!1,message:"Database connection test failed: No rows returned"})}catch(a){return console.error("[DB-CHECK] Database connection error:",a),{connected:!1,message:`Database connection failed: ${a instanceof Error?a.message:String(a)}`}}}const Pl=async(t,l)=>{try{return console.log("[LOGOUT] Starting logout process"),Qe(l),l.redirect(302,"/auth"),{success:!0}}catch(a){return console.error("Logout error:",a),{success:!1,error:a instanceof Error?a.message:"Logout failed"}}},Ul=ge(h(Pl,"s_iyKbdfOHuOI")),jl=async(t,l)=>{const a=z(l),{email:o}=t;try{return{success:!0,isRegistered:(await a.execute({sql:"SELECT id FROM users WHERE email = ?",args:[o]})).rows.length>0}}catch(s){return console.error("Email check error:",s),{success:!1,error:s instanceof Error?s.message:"Failed to check email"}}},Je=ge(h(jl,"s_Emz3Bmx8A2s")),Dl=async(t,l)=>{const a=z(l),{email:o,password:s,fullName:r}=t;try{const i=await Ut(s),c=await a.execute({sql:"SELECT COUNT(*) as count FROM users",args:[]}),g=c.rows.length>0&&c.rows[0].count===0;let p,u;u=g?"admin":"normal";const m=r?"INSERT INTO users (email, password_hash, type, name) VALUES (?, ?, ?, ?)":"INSERT INTO users (email, password_hash, type) VALUES (?, ?, ?)",f=r?[o,i,u,r.trim()]:[o,i,u];if(p=(await a.execute({sql:m,args:f})).lastInsertRowid,!p)throw new Error("Registration failed: userId is undefined");const y=String(p);return Ye(l,y,u),u==="admin"?l.redirect(302,"/"):l.redirect(302,"/chat"),{success:!0}}catch(i){return console.error("Registration error:",i),{success:!1,error:i instanceof Error?i.message:"Registration failed"}}},et=ge(h(Dl,"s_dp10BsJQTcg")),Nl=async(t,l)=>{const a=z(l),{email:o,password:s}=t;try{const i=(await a.execute({sql:"SELECT * FROM users WHERE email = ?",args:[o]})).rows[0];if(!i||typeof i.password_hash!="string"||!i.id)return{success:!1,error:"Invalid user data"};if(!await jt(s,i.password_hash))return{success:!1,error:"Invalid password"};const g=String(i.id);await a.execute({sql:"UPDATE users SET session_expires = ? WHERE id = ?",args:[new Date(Date.now()+36e5),g]});const p=i.type==="admin"?"admin":i.type==="coordinator"?"coordinator":"normal";return Ye(l,g,p),p==="admin"?l.redirect(302,"/"):l.redirect(302,"/chat"),{success:!0}}catch(r){return console.error("Login error:",r),{success:!1,error:"Login failed"}}},tt=ge(h(Nl,"s_R0sJTR90Tks")),Bl=async t=>{console.log("[AUTH-SETUP] Starting database setup");try{const l=await Ol(t);if(!l.connected)return console.error("[AUTH-SETUP] Database connection failed:",l.message),{success:!1,error:"Database connection failed. Check your environment configuration.",details:l.message};const a=await $l(t);if(!a.success)return console.error("[AUTH-SETUP] Database initialization failed:",a.message),{success:!1,error:"Failed to initialize authentication database.",details:a.message};const o=ke(t);return console.log(`[AUTH-SETUP] Current user ID: ${o||"none"}`),console.log("[AUTH-SETUP] Database setup completed successfully"),{success:!0,message:"Database initialized successfully",user_id:o}}catch(l){return console.error("[AUTH-SETUP] Unexpected error during setup:",l),{success:!1,error:"An unexpected error occurred during setup",details:l instanceof Error?l.message:String(l)}}},lt=de(h(Bl,"s_wERsQ0wluBY")),Fl=()=>{var r,i;const[t,l,a,o,s]=k();(r=t.value)!=null&&r.success?(s.value=t.value.isRegistered?"password":"register",l.value=document.getElementById("email").value):a.value=((i=t.value)==null?void 0:i.error)||"Failed to check email",o.value=!1},zl=()=>{var o,s;const[t,l,a]=k();(o=a.value)!=null&&o.success||(t.value=((s=a.value)==null?void 0:s.error)||"Login failed"),l.value=!1},Hl=()=>{const[t,l,a]=k(),o=a.value;o&&typeof o=="object"&&"success"in o&&!o.success&&(t.value=o&&"error"in o&&o.error?String(o.error):"Registration failed"),l.value=!1},Vl=()=>{var u,m,f;be();const t=lt(),l=Je(),a=et(),o=tt(),s=b("email"),r=b(""),i=b(""),c=b(""),g=b(!1),p=b(null);return(u=t.value)!=null&&u.success?(console.log("Tables initialized successfully"),p.value="Database ready"):(m=t.value)!=null&&m.error&&(console.error("Database setup error:",t.value.error),p.value=`Database Error: ${t.value.error}`,c.value=t.value.error),e("div",null,{class:"min-h-screen w-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative"},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden z-0"},[e("div",null,{class:"w-3 h-3 bg-teal-400/50 dark:bg-teal-300/40 rounded-full absolute top-[20%] left-[35%] animate-[pulse_4s_infinite]"},null,3,null),e("div",null,{class:"w-2 h-2 bg-green-400/50 dark:bg-green-300/40 rounded-full absolute top-[60%] left-[70%] animate-[pulse_5s_infinite]",style:"animation-delay: 0.7s;"},null,3,null),p.value&&e("div",null,{class:"fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-4 py-2 text-sm max-w-xs text-center z-50"},v(x=>x.value,[p],"p0.value"),3,"lQ_0")],1,null),e("div",null,{class:"absolute top-6 left-1/2 transform -translate-x-1/2"},e("div",null,{class:"flex items-center"},[e("div",null,{class:"relative"},e("div",null,{class:"w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white shadow-lg"},d(Z,{class:"w-6 h-6",[n]:{class:n}},3,"lQ_1"),1,null),1,null),e("div",null,{class:"ml-2 flex flex-col"},[e("h1",null,{class:"text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400"},"Move On Academy",3,null),e("span",null,{class:"text-xs text-teal-700 dark:text-teal-400"},"Language Learning Platform",3,null)],3,null)],1,null),1,null),e("div",null,{class:"max-w-md w-full z-10"},[e("div",null,{class:"bg-white dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]"},[e("div",null,{class:"text-center mb-8"},[e("h2",null,{class:"text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400"},v(x=>x.value==="email"?"Welcome Back!":x.value==="password"?"Sign In":"Join Move On Academy",[s],'p0.value==="email"?"Welcome Back!":p0.value==="password"?"Sign In":"Join Move On Academy"'),3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},v((x,y)=>y.value==="email"?"Enter your email to continue":y.value==="password"?`Signing in as ${x.value}`:`Complete registration for ${x.value}`,[r,s],'p1.value==="email"?"Enter your email to continue":p1.value==="password"?`Signing in as ${p0.value}`:`Complete registration for ${p0.value}`'),3,null)],3,null),s.value==="email"&&d(pe,{action:l,class:"space-y-6",onSubmit$:h(Fl,"s_0W0s83zLYU4",[l,r,c,g,s]),children:[e("div",null,{class:"space-y-2"},[e("label",null,{for:"email",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Email Address",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},d(Qt,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_2"),1,null),e("input",null,{id:"email",name:"email",type:"email",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700",placeholder:"you@example.com"},null,3,null)],1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"We'll check if you already have an account",3,null)],1,null),e("button",null,{type:"submit",disabled:v(x=>x.value,[g],"p0.value"),class:"w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:_("s_nhTrYlK9e5w",[c,g])},g.value?e("span",null,{class:"flex items-center"},[d(me,{class:"animate-spin mr-2 h-5 w-5 text-white",[n]:{class:n}},3,"lQ_3"),"Checking..."],1,"lQ_4"):"Continue",1,null)],[n]:{action:n,class:n,onSubmit$:n}},1,"lQ_5"),s.value==="password"&&d(pe,{action:o,class:"space-y-6",onSubmit$:h(zl,"s_XMeAkUxhnZI",[c,g,o]),children:[e("input",null,{type:"hidden",name:"email",value:v(x=>x.value,[r],"p0.value")},null,3,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"password",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Password",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},d(De,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_6"),1,null),e("input",null,{id:"password",name:"password",type:"password",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700",placeholder:"••••••••"},null,3,null)],1,null),e("div",null,{class:"flex justify-end"},e("a",null,{href:"#",class:"text-sm text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"},"Forgot password?",3,null),3,null)],1,null),e("div",null,{class:"flex justify-between items-center"},[e("button",null,{type:"button",class:"flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm",onClick$:_("s_Hkz91dGcq04",[c,i,s])},[d(Ue,{class:"mr-2 h-4 w-4",[n]:{class:n}},3,"lQ_7"),"Back"],1,null),e("button",null,{type:"submit",disabled:v(x=>x.value,[g],"p0.value"),class:"flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:_("s_iXE2aeUX0tQ",[c,g])},g.value?e("span",null,{class:"flex items-center"},[d(me,{class:"animate-spin mr-2 h-5 w-5 text-white",[n]:{class:n}},3,"lQ_8"),"Signing in..."],1,"lQ_9"):"Sign In",1,null)],1,null)],[n]:{action:n,class:n,onSubmit$:n}},1,"lQ_10"),s.value==="register"&&d(pe,{action:a,class:"space-y-6",onSubmit$:h(Hl,"s_BNuG0tWAYzo",[c,g,a]),children:[e("input",null,{type:"hidden",name:"email",value:v(x=>x.value,[r],"p0.value")},null,3,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"password",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Create Password",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},d(De,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_11"),1,null),e("input",null,{id:"password",name:"password",type:"password",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700",placeholder:"Choose a strong password",minLength:6},null,3,null)],1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"Password must be at least 6 characters",3,null)],1,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"fullName",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Full Name (Optional)",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},d(Jt,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_12"),1,null),e("input",null,{id:"fullName",name:"fullName",type:"text",class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700",placeholder:"Your Name"},null,3,null)],1,null)],1,null),e("div",null,{class:"flex justify-between items-center"},[e("button",null,{type:"button",class:"flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm",onClick$:_("s_ivZv3s0Fr3k",[c,i,s])},[d(Ue,{class:"mr-2 h-4 w-4",[n]:{class:n}},3,"lQ_13"),"Back"],1,null),e("button",null,{type:"submit",disabled:v(x=>x.value,[g],"p0.value"),class:"flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:_("s_857oCKNI0eQ",[c,g])},g.value?e("span",null,{class:"flex items-center"},[d(me,{class:"animate-spin mr-2 h-5 w-5 text-white",[n]:{class:n}},3,"lQ_14"),"Creating account..."],1,"lQ_15"):"Create Account",1,null)],1,null)],[n]:{action:n,class:n,onSubmit$:n}},1,"lQ_16"),c.value&&e("div",null,{class:"mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-[slide-up_0.3s_ease-out]"},e("div",null,{class:"flex items-start"},[d(Ht,{class:"h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0",[n]:{class:n}},3,"lQ_17"),e("div",null,null,[e("p",null,{class:"text-sm text-red-600 dark:text-red-300 font-semibold"},v(x=>x.value,[c],"p0.value"),3,null),((f=t.value)==null?void 0:f.details)&&e("p",null,{class:"text-xs text-red-500 dark:text-red-300 mt-1"},["Details: ",v(x=>x.value.details,[t],"p0.value.details")],3,"lQ_18")],1,null)],1,null),1,"lQ_19"),!1],1,null),e("div",null,{class:"mt-6 text-center text-sm text-gray-600 dark:text-gray-400"},["By continuing, you agree to the Move On Academy",e("a",null,{href:"/terms",class:"text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 ml-1"},"Terms of Service",3,null),e("span",null,{class:"mx-1"},"and",3,null),e("a",null,{href:"/privacy",class:"text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"},"Privacy Policy",3,null)],3,null)],1,null),e("style",null,null,`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -15px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 15px); }
          100% { transform: translate(0, 0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px white inset !important;
          box-shadow: 0 0 0px 1000px white inset !important;
          border-color: #d1d5db !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover,
        .dark input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #374151 inset !important; /* Use gray-700 */
          box-shadow: 0 0 0px 1000px #374151 inset !important; /* Use gray-700 */
          border-color: #4B5563 !important;
          -webkit-text-fill-color: #F3F4F6 !important;
        }
      `,3,null)],1,"lQ_22")},ql=L(h(Vl,"s_Rhbq243Q8qQ")),Yl=Object.freeze(Object.defineProperty({__proto__:null,default:ql,useCheckEmail:Je,useLogin:tt,useLogout:Ul,useRegister:et,useTableSetup:lt},Symbol.toStringTag,{value:"Module"})),ye=10,ne={}.DID_API_URL||"https://api.d-id.com",Te=t=>{for(const l of ue)if(l.value===t)return l.code;return"US"},oe={US:Mt,ES:Lt,IT:$t,FR:Ot,BR:Pt},ue=[{value:"en-US",label:"English",code:"US",flagSvg:oe.US},{value:"es-ES",label:"Spanish",code:"ES",flagSvg:oe.ES},{value:"it-IT",label:"Italian",code:"IT",flagSvg:oe.IT},{value:"fr-FR",label:"French",code:"FR",flagSvg:oe.FR},{value:"pt-BR",label:"Portuguese",code:"BR",flagSvg:oe.BR}],Q={"en-US":"English","es-ES":"Spanish","it-IT":"Italian","fr-FR":"French","pt-BR":"Portuguese"},ze={"en-US":{type:"microsoft",voice_id:"en-US-JennyNeural"},"es-ES":{type:"microsoft",voice_id:"es-ES-AbrilNeural"},"it-IT":{type:"microsoft",voice_id:"it-IT-IsabellaNeural"},"fr-FR":{type:"microsoft",voice_id:"fr-FR-DeniseNeural"},"pt-BR":{type:"microsoft",voice_id:"pt-BR-BrendaNeural"}},nt=t=>ze[t]||ze["en-US"],at=t=>{if(!t)return"";let l=t.replace(/\*\*([^*]+)\*\*/g,"$1");return l=l.replace(/\*([^*]+)\*/g,"$1"),l=l.replace(/~~([^~]+)~~/g,"$1"),l=l.replace(/`([^`]+)`/g,"$1"),l=l.replace(/```[a-z]*\n([\s\S]*?)```/g,"code block omitted"),l=l.replace(/^#{1,6}\s+(.+)$/gm,"$1"),l=l.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),l=l.replace(/https?:\/\/\S+/g,"URL"),l=l.replace(/www\.\S+/g,"URL"),l=l.replace(/\n\s*[-•*+]\s*/g,", "),l=l.replace(/\n/g," "),l=l.replace(/[#_~<>{}|]/g,""),l=l.replace(/&[a-z]+;/g," "),l=l.replace(/["']([^"']+)["']/g,"$1"),l=l.replace(/\s+/g," ").trim(),l},Ql=B(function(){const t=this.env.get("DID_API_KEY")||{}.DID_API_KEY;return t?`Basic ${t}`:(console.error("D-ID API Key is not configured on the server."),"")},"cZmc7P5UUuA"),ae=N(h(Ql,"s_cZmc7P5UUuA")),Kl=B(async function(t,l,a=0){try{console.log(`Server Fetch: Making request to: ${t}`,{method:l.method});const r=await fetch(t,l);if(!r.ok){const i=await r.text().catch(()=>"No error details");if(console.error(`Server Fetch: Request failed status ${r.status}: ${i}`),r.status===401||r.status===403)throw console.error("Server Fetch: Authentication failed. Check D-ID API key."),new Error(`Authentication failed: ${r.status}`);if(a<3){const c=Math.min(Math.pow(2,a)/4+Math.random(),4)*3e3;return console.log(`Server Fetch: Retrying in ${c}ms...`),await new Promise(g=>setTimeout(g,c)),K(t,l,a+1)}throw new Error(`Server Fetch: Request failed status: ${r.status}`)}return r}catch(r){if(a<3){const i=Math.min(Math.pow(2,a)/4+Math.random(),4)*3e3;return console.log(`Server Fetch: Request error: ${r.message}, retrying in ${i}ms...`),await new Promise(c=>setTimeout(c,i)),K(t,l,a+1)}throw console.error("Server Fetch: Max retries exceeded:",r),r}},"ZZpOGQZsXss"),K=N(h(Kl,"s_ZZpOGQZsXss")),Wl=B(async function(){console.log("Server: Step 1: Creating a new stream");const t=await ae();if(!t)throw new Error("Server Auth Header failed");const a=await(await K(`${ne}/talks/streams`,{method:"POST",headers:{Authorization:t,"Content-Type":"application/json"},body:JSON.stringify({source_url:"https://i.postimg.cc/fLdQq0DW/thumbnail.jpg"})})).json();if(console.log("Server: Stream creation response:",a),!a.id||!a.session_id)throw new Error("Server: Stream ID or Session ID missing");return{streamId:a.id,offer:a.offer||a.jsep,iceServers:a.ice_servers,sessionId:a.session_id}},"CfpRc90J9U4"),rt=N(h(Wl,"s_CfpRc90J9U4")),Xl=B(async function(t,l,a){console.log("Server: Step 3: Sending SDP answer");const o=await ae();if(!o)throw new Error("Server Auth Header failed");const s=await K(`${ne}/talks/streams/${t}/sdp`,{method:"POST",headers:{Authorization:o,"Content-Type":"application/json"},body:JSON.stringify({answer:a,session_id:l})});if(!s.ok)throw new Error(`Server: SDP response error: ${s.status}`);return console.log("Server: SDP answer sent successfully"),await s.json()},"3nz0mRTbAs8"),st=N(h(Xl,"s_3nz0mRTbAs8")),Gl=B(async function(t,l,a){console.log("Server: Sending ICE candidate");const o=await ae();if(!o)throw new Error("Server Auth Header failed");const s=await K(`${ne}/talks/streams/${t}/ice`,{method:"POST",headers:{Authorization:o,"Content-Type":"application/json"},body:JSON.stringify({...a,session_id:l})});s.ok?console.log("Server: ICE candidate sent successfully"):console.error(`Server: Failed to send ICE candidate: ${s.status}`)},"9bTWdD9eHtM"),ot=N(h(Gl,"s_9bTWdD9eHtM")),Zl=B(async function(t,l,a,o){console.log("Server: Step 4: Creating a talk");const s=await ae();if(!s)throw new Error("Server Auth Header failed");const r=await K(`${ne}/talks/streams/${a}`,{method:"POST",headers:{Authorization:s,"Content-Type":"application/json"},body:JSON.stringify({session_id:o,script:{type:"text",input:at(t),provider:{type:l.type,voice_id:l.voice_id}},config:{stitch:!0},driver_url:"bank://lively"})});if(!r.ok)throw new Error(`Server: Talk request failed status: ${r.status}`);const i=await r.json();return console.log("Server: Talk created successfully:",i),i},"zVEU324USAY"),it=N(h(Zl,"s_zVEU324USAY")),Jl=B(async function(t,l){if(!t||!l)return;console.log("Server: Step 5: Closing the stream");const a=await ae();if(!a){console.error("Server: Cannot close stream, auth header failed");return}try{await K(`${ne}/talks/streams/${t}`,{method:"DELETE",headers:{Authorization:a,"Content-Type":"application/json"},body:JSON.stringify({session_id:l})}),console.log("Server: Stream closed successfully")}catch(o){console.error("Server: Error closing stream:",o.message)}},"EshFHZDaKXA"),ct=N(h(Jl,"s_EshFHZDaKXA")),ut=(t,l=ye)=>{if(t.length<=l)return[...t];const a=t.filter(r=>r.role==="system"),s=t.filter(r=>r.role!=="system").slice(-l);return[...a,...s]},en=B(async function(t,l,a,o=[]){console.log("Server: Fetching LangChain response for thread:",l);const s=this.env.get("OPENAI_API_KEY")||{}.OPENAI_API_KEY;if(!s)return console.error("OpenAI API Key not configured on server."),"Error: AI service not configured.";try{const r=new Ae({openAIApiKey:s,model:"gpt-4o-mini",temperature:0}),i=`You are a helpful assistant for MOVE ON ACADEMY, a Language Academy. Answer all questions to the best of your ability in ${a}.`,c=o.some(f=>f.role==="system");let g=[...o];c||g.unshift({role:"system",content:i}),g.push({role:"user",content:t});const u=ut(g).map(f=>f.role==="system"?new G(f.content):f.role==="user"?new xe(f.content):new Ie(f.content));console.log(`Server: Using ${u.length} messages for context`);const m=await r.invoke(u);return console.log("Server: LangChain response:",m.content),m.content}catch(r){return console.error("Server: Error in LangChain model:",r),"I'm sorry, I encountered an error processing your request."}},"dVPtsXiqStU"),dt=N(h(en,"s_dVPtsXiqStU")),tn=B(async function(t,l,a){console.log("Server: Processing audio with OpenAI STT");const o=this.env.get("OPENAI_API_KEY");if(!o)return console.error("OpenAI API Key not configured on server."),"Error: Speech service not configured.";try{const s=Buffer.from(t,"base64"),r=new FormData,i=new Blob([s],{type:l});r.append("file",i,"audio.webm");let c="";switch(a.toLowerCase()){case"english":c="en";break;case"spanish":c="es";break;case"italian":c="it";break;case"french":c="fr";break;case"portuguese":c="pt";break;default:c="en"}r.append("language",c),console.log(`Server: Audio processing - Using language code '${c}' for '${a}'`),r.append("prompt",`The following is a conversation in ${a}. Please transcribe accurately maintaining the original language.`),r.append("model","whisper-1"),r.append("response_format","text"),console.log("Server: Sending audio data to OpenAI, size:",s.length,"bytes");const g=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:`Bearer ${o}`},body:r});if(!g.ok){const u=await g.text();throw console.error("Server: OpenAI STT API error:",g.status,u),new Error(`OpenAI STT API error: ${g.status}`)}const p=await g.text();return console.log(`Server: Transcription result (${a}):`,p),console.log(`Server: Transcription length: ${p.length} characters`),p.trim()}catch(s){return console.error("Server: Error processing audio with OpenAI:",s),"Error processing audio."}},"Q89AFdX2E0U"),gt=N(h(tn,"s_Q89AFdX2E0U")),ln=B(async function(t,l,a,o){if(!o){console.warn("Server: Cannot save chat message, user not logged in.");return}console.log("Server: Saving chat message for user:",o);try{const s=z(this),r=await s.execute({sql:"PRAGMA table_info(chat_history)"});console.log("Chat history table structure:",r.rows);const i=r.rows.map(p=>p.name);console.log("Chat history columns:",i.join(", "));const c=r.rows.find(p=>p.name==="user_id"||p.name==="userId");if(!c){console.error("Server: chat_history table is missing the user_id/userId column!");return}const g=c.name;console.log(`Server: Using column name "${g}" for user ID`);try{const p=`INSERT INTO chat_history (${g}, role, content, timestamp) VALUES (?, ?, ?, ?)`,u=await s.execute({sql:p,args:[o,"user",l,new Date().toISOString()]});console.log("Server: User message saved successfully",u);const m=await s.execute({sql:p,args:[o,"assistant",a,new Date().toISOString()]});console.log("Server: Assistant message saved successfully",m)}catch(p){throw console.error("Server: SQL insert error:",p.message),p.message.includes("no column named")&&(console.error("Server: Column name error - check that column names match exactly with the schema"),console.error("Server: Available columns:",i.join(", ")),console.error("Server: Attempted to use column:",g)),p}console.log("Server: Chat messages saved successfully")}catch(s){console.error("Server: Error saving chat message to Turso:",s.message),console.error("Server: Error details:",s)}},"t5qavYemaxA"),pt=N(h(ln,"s_t5qavYemaxA")),nn=B(async function(t,l){if(!t){console.warn("Server: Cannot update language, user not logged in.");return}console.log("Server: Updating language for user:",t,"to",l);try{const a=z(this),o=await a.execute({sql:"PRAGMA table_info(users)"});console.log("Users table structure:",o.rows);const s=o.rows.find(r=>r.name.toLowerCase().includes("chatbot")&&r.name.toLowerCase().includes("lang"));if(s){const r=s.name;console.log(`Found language column: ${r}`),await a.execute({sql:`UPDATE users SET ${r} = ? WHERE id = ?`,args:[l,t]}),console.log("Server: User language updated successfully")}else console.error("Server: Couldn't find chatbot language column in users table")}catch(a){console.error("Server: Error updating user language in Turso:",a.message)}},"Q1ZuWs0UdZw"),an=N(h(nn,"s_Q1ZuWs0UdZw")),rn=B(async function(t,l=50){if(!t)return console.warn("Server: Cannot load chat history, user not logged in."),[];console.log("Server: Loading chat history for user:",t);try{const s=(await z(this).execute({sql:"SELECT role, content, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC LIMIT ?",args:[t,l*2]})).rows.map(r=>({role:r.role,content:r.content,timestamp:r.timestamp}));if(console.log(`Server: Loaded ${s.length} chat history messages`),s.length>ye){const r=Math.max(0,s.length-ye),i=s[r].role==="assistant"?r-1:r,c=s.slice(Math.max(0,i));return console.log(`Server: Trimmed history from ${s.length} to ${c.length} messages`),c}return s}catch(a){return console.error("Server: Error loading chat history:",a.message),[]}},"PJb0eS0Gg0U");N(h(rn,"s_PJb0eS0Gg0U"));const sn=async t=>{var s,r;const l=t.sharedMap.get("session");let a="en-US",o;if((s=l==null?void 0:l.user)!=null&&s.id)o=l.user.id;else{const i=(r=t.cookie.get("auth_token"))==null?void 0:r.value;if(!i)throw console.log("[CHAT] No authentication found, redirecting to login"),t.redirect(302,"/auth/");console.log("[CHAT] Using auth_token cookie for authentication"),o=i}try{const i=z(t),c=o,g=await i.execute({sql:"PRAGMA table_info(users)"});console.log("[CHAT] Users table structure:",g.rows);const p=g.rows.find(u=>u.name.toLowerCase().includes("chatbot")&&u.name.toLowerCase().includes("lang"));if(p){const u=p.name;console.log(`[CHAT] Found language column: ${u}`);const m=await i.execute({sql:`SELECT ${u} AS chatbot_language FROM users WHERE id = ? LIMIT 1`,args:[c]});if(m.rows.length>0&&m.rows[0].chatbot_language){const f=m.rows[0].chatbot_language;ue.some(y=>y.value===f)?a=f:console.warn(`[CHAT] Loaded invalid language '${f}' for user ${o}, using default.`)}}else console.warn("[CHAT] Couldn't find chatbot language column in users table")}catch(i){console.error("[CHAT] Failed to load user language from DB:",i.message)}return{initialLanguage:a,userId:o,initialThreadId:crypto.randomUUID()}},mt=de(h(sn,"s_2OxiK9FAl0U")),on=()=>{const[t,l,a,o,s,r]=k();if(l.value||t.value){console.log("Not playing idle video while loading or initiating");return}const i=r.value;if(!i){console.error("Cannot play idle video - video element reference is null");return}console.log("Attempting to play idle video");const c=o.value,g=c&&c.connectionState==="connected";if(g&&i.srcObject instanceof MediaStream){if(i.srcObject.getVideoTracks().filter(m=>m.readyState==="live"&&!m.muted).length>0&&s.value){console.log("Active video stream with data is playing, not switching to idle");return}console.log("Switching to idle despite connection because stream is inactive")}if(i.srcObject instanceof MediaStream)try{const u=i.srcObject.getTracks();g?(console.log("Preserving WebRTC tracks while switching to idle"),u.forEach(m=>{console.log(`Track preserved: ${m.id}, kind: ${m.kind}, state: ${m.readyState}`)})):(console.log("No active connection, safely stopping all tracks"),u.forEach(m=>{console.log(`Stopping track: ${m.id}, kind: ${m.kind}, state: ${m.readyState}`),m.stop()}))}catch(u){console.warn("Error handling stream tracks:",u)}if(i.src&&i.src.includes("prs_alice.idle.mp4")&&!i.paused&&!i.ended&&i.readyState>=3){console.log("Idle video already playing correctly, no need to restart");return}i.srcObject=null,i.pause(),i.removeAttribute("srcObject"),i.currentTime=0;const p=window.location.origin+"/prs_alice.idle.mp4";console.log("Idle video path:",p);try{i.removeAttribute("src"),i.load(),i.muted=!0,i.loop=!0,i.style.display="block",i.autoplay=!0,i.playsInline=!0,i.controls=!1,i.src=p,i.load(),console.log("Video configured, attempting to play idle video");const u=()=>i.play().then(()=>(console.log("Idle video playing successfully"),s.value=!1,setTimeout(()=>{i.muted=a.value},300),!0)).catch(m=>(console.error("Error playing idle video:",m),!1));u().then(m=>{m||(console.log("Retrying with forced mute after delay"),i.muted=!0,setTimeout(()=>{u().then(f=>{f||(console.log("Final retry with video reload"),i.load(),i.muted=!0,i.autoplay=!0,i.currentTime=0,i.play().catch(x=>{console.error("All idle video play attempts failed:",x)}))})},500))})}catch(u){console.error("Exception setting up idle video:",u)}},cn=(t,l)=>{const[a,o,s,r,i]=k();console.log("Video status change called - isPlaying:",t,"stream exists:",!!l);const c=a.value||o.value;if(t&&l){const g=l.getVideoTracks(),p=g.length>0&&g.some(u=>u.readyState==="live");if(console.log(`Stream has ${g.length} video tracks, active: ${p}`),p){if(console.log("Setting active video stream with live tracks"),c){console.log("Currently initiating or loading, scheduling stream for later"),setTimeout(()=>{if(i.value){console.log("Setting delayed video stream");const u=i.value;!u.srcObject||!(u.srcObject instanceof MediaStream)||u.srcObject.getVideoTracks().length===0?(console.log("Setting stream with safe transition"),u.srcObject=l,u.muted=s.value,u.style.display="block",u.play().catch(m=>{console.error("Error playing delayed video:",m),m.name==="NotAllowedError"&&(u.muted=!0,u.play().catch(f=>console.error("Still cannot play video:",f)))})):console.log("Video already has a valid srcObject, skipping update")}},1e3);return}if(i.value)try{const u=i.value;u.src&&(u.pause(),u.removeAttribute("src"),u.load()),console.log("Setting stream directly to video element"),u.srcObject=l,u.muted=s.value,u.style.display="block";const m=u.play();m!==void 0&&m.catch(f=>{console.error("Error playing video:",f),f.name==="NotAllowedError"&&(u.muted=!0,u.play().catch(x=>console.error("Still cannot play video:",x)))})}catch(u){console.error("Error setting video stream:",u)}else console.warn("Video ref is null, cannot set stream")}else console.log("Stream has no active tracks or all tracks ended"),c?console.log("Processing in progress, keeping current video state"):(console.log("No processing in progress, switching to idle video"),r())}else c?console.log("Loading or initiating, not switching to idle video yet"):(console.log("No active stream, playing idle video"),r())},un=()=>{const[t]=k(),l=t.value;l&&console.log("ICE gathering state:",l.iceGatheringState)},dn=async t=>{const[l,a,o]=k(),s=l.value;if(!t.candidate||!o.value||!a.value||!s)return;console.log("ICE candidate:",t.candidate);const{candidate:r,sdpMid:i,sdpMLineIndex:c}=t.candidate;try{await ot(o.value,a.value,{candidate:r,sdpMid:i,sdpMLineIndex:c})}catch(g){console.error("Client: Failed to send ICE candidate via server:",g)}},gn=()=>{const[t,l,a,o]=k(),s=o.value;if(!s)return;const r=s.iceConnectionState;console.log("ICE connection state:",r),r==="connected"||r==="completed"?(a.value&&(clearTimeout(a.value),a.value=null),t.value=!0,l.value=null,console.log("Connection established successfully")):(r==="failed"||r==="closed"||r==="disconnected")&&(console.error("ICE connection failed or closed"),closePC$(!1),t.value=!1,l.value="Connection failed. Please try reconnecting.")},pn=()=>{const[t,l,a]=k(),o=a.value;if(!o)return;const s=o.connectionState;console.log("Peer connection state:",s),s==="connected"?(t.value=!0,l.value=null):(s==="failed"||s==="closed")&&(t.value=!1,l.value="Connection failed. Please try reconnecting.",closePC$(!1))},mn=()=>{const[t]=k(),l=t.value;l&&console.log("Signaling state:",l.signalingState)},hn=t=>{const[l,a,o,s,r,i,c,g]=k();console.log("onTrack event fired:",t);const p=r.value;if(!t.track||!p){console.log("onTrack: Event received but no valid track or PC found.");return}console.log(`Track received: ${t.track.id}, kind: ${t.track.kind}, state: ${t.track.readyState}`),t.track.addEventListener("ended",()=>{console.log(`Track ended: ${t.track.id}, kind: ${t.track.kind}`)}),t.track.addEventListener("unmute",()=>{if(console.log(`Track unmuted: ${t.track.id}, kind: ${t.track.kind}`),t.streams&&t.streams.length>0){const u=t.streams[0];if(t.track.kind==="video"&&u.getVideoTracks().length>0)if(console.log("Video stream available after unmute"),!a.value||c.value){const m=g.value;m&&(console.log("Setting unmuted stream directly to video element"),m.srcObject=u,m.style.display="block",m.muted=o.value,m.play().catch(f=>{console.error("Error playing unmuted stream:",f),f.name==="NotAllowedError"&&(m.muted=!0,m.play().catch(x=>{console.error("Still cannot play unmuted stream:",x)}))}))}else console.log("Not setting video element yet as we are still loading or waiting for active tracks")}}),i.value&&(clearInterval(i.value),i.value=null),i.value=setInterval(async()=>{if(!p||p.connectionState!=="connected"){i.value&&clearInterval(i.value),i.value=null;return}try{const u=p.getReceivers();let m=!1,f=0;const x=u.filter(y=>y.track&&y.track.kind==="video"&&y.track.readyState==="live").map(y=>y.track);console.log(`Found ${x.length} active video tracks`),x.length>0&&(await p.getStats()).forEach(T=>{if(T.type==="inbound-rtp"&&"mediaType"in T&&T.mediaType==="video"){m=!0;const $="bytesReceived"in T?T.bytesReceived:0;f+=$;const E=$>l.value&&$>0;if(c.value!==E)if(c.value=E,E){console.log("D-ID video stream now actively receiving data, switching from idle");const P=u.filter(j=>j.track&&j.track.readyState==="live").map(j=>j.track),U=new MediaStream(P);s(!0,U)}else a.value||(console.log("D-ID video stream paused, reverting to idle"),s(!1,null));l.value=f}}),!m&&c.value&&(console.log("No active video tracks found in stats"),c.value=!1,a.value||s(!1,null))}catch(u){console.error("Error getting stats:",u)}},1e3),console.log("Track handler set up, waiting for active video data before switching from idle")},fn=(t=!0)=>{const[l,a,o,s,r,i,c,g,p,u,m,f,x,y,T,$]=k(),E=u.value;if(!E)return;console.log("Client: Closing peer connection"),E.removeEventListener("icegatheringstatechange",c),E.removeEventListener("icecandidate",r),E.removeEventListener("iceconnectionstatechange",i),E.removeEventListener("connectionstatechange",s),E.removeEventListener("signalingstatechange",g),E.removeEventListener("track",p),x.value&&(clearInterval(x.value),x.value=null),a.value&&(clearTimeout(a.value),a.value=null);const R=$.value;if(R!=null&&R.srcObject&&R.srcObject instanceof MediaStream){console.log("Stopping tracks during PC close - this IS the right place to stop tracks");const P=R.srcObject.getTracks();console.log(`Stopping ${P.length} tracks during peer connection close`),P.forEach(U=>{console.log(`Stopping track: ${U.id}, kind: ${U.kind}, state: ${U.readyState}`),U.stop()}),R.srcObject=null}E.close(),u.value=null,l.value=!1,T.value=!1,o.value=0,console.log("Client: Peer connection closed"),t&&y.value&&f.value&&(ct(y.value,f.value).catch(P=>{console.error("Client: Error during server close stream:",P)}),y.value="",f.value=""),setTimeout(()=>{m(),console.log("Reproduciendo video de espera después de cerrar conexión")},500)},xn=async(t,l)=>{const[a,o,s,r,i,c,g,p]=k();p.value&&(console.warn("Closing existing peer connection before creating new one."),a(!1));try{console.log("Client: Creating Peer Connection");const u=new RTCPeerConnection({iceServers:l});u.addEventListener("icegatheringstatechange",i),u.addEventListener("icecandidate",s),u.addEventListener("iceconnectionstatechange",r),u.addEventListener("connectionstatechange",o),u.addEventListener("signalingstatechange",c),u.addEventListener("track",g),console.log("Client: Setting remote description"),await u.setRemoteDescription(t),console.log("Client: Creating answer");const m=await u.createAnswer();return console.log("Client: Setting local description"),await u.setLocalDescription(m),p.value=Ve(u),m}catch(u){throw console.error("Client: Error creating peer connection:",u),p.value=null,u}},yn=async()=>{const[t,l,a,o,s,r,i,c,g,p]=k();if(!(l.value||r.value)){r.value=!0,a.value=null,t(!1);try{c(),console.log("Client: Calling serverInitConnection");const{streamId:u,offer:m,iceServers:f,sessionId:x}=await rt();p.value=u,g.value=x,console.log("Client: Stream/Session IDs received:",u,x),console.log("Client: Creating peer connection with offer");const y=await s(m,f);console.log("Client: Sending SDP answer via server"),await st(u,x,y),o.value&&clearTimeout(o.value),o.value=setTimeout(()=>{if(!l.value){console.error("Connection timeout - checking status");const T=i.value;T&&(T.iceConnectionState==="checking"||T.iceConnectionState==="connected"||T.iceConnectionState==="completed")?(console.log("Connection appears stable despite timeout - forcing connected state"),l.value=!0,a.value=null):(console.error("Connection truly timed out"),a.value="Connection timed out. Please try reconnecting.",t(!0))}},15e3),console.log("Client: Waiting for ICE connection...")}catch(u){console.error("Client: Error during connection initialization:",u),a.value=`Connection error: ${u.message||"Unknown error"}`,t(!0),l.value=!1,p.value="",g.value="",setTimeout(()=>{c(),console.log("Attempting to play idle video after connection error")},1e3)}finally{r.value=!1}}},bn=()=>{const[t,l]=k();t.value=!t.value,l.value&&(l.value.muted=t.value),console.log(`Video ${t.value?"muted":"unmuted"}`)},vn=()=>{const[t]=k();console.log("Manual reconnect triggered"),t()},kn=async t=>{var U;const[l,a,o,s,r,i,c,g,p,u,m,f,x,y,T,$,E,R,P]=k();if(t.trim()){p.value=!0,s.value=null,l.push({role:"user",content:t}),c.value&&(c.value.value="");try{console.log("Client: Fetching LangChain response with chat history context");const j=l.map(I=>({role:I.role,content:I.content})),Y=await dt(t,E.value,Q[r.language]||"English",j);if(l.push({role:"assistant",content:Y}),(U=i.value)!=null&&U.userId&&pt(y.value||"no-session",t,Y,i.value.userId).catch(I=>console.error("Client: Failed to save chat message:",I)),u.value){console.log("Video muted, skipping talk creation."),p.value=!1;return}if(!o.value||!$.value||!y.value){console.warn("Not connected, attempting to connect before talk...");try{if(await a(),await new Promise(I=>setTimeout(I,3e3)),!o.value||!$.value||!y.value){console.error("Connection failed after reconnect attempt, cannot create talk."),s.value="Connection failed. Cannot play response.",p.value=!1;return}console.log("Successfully reconnected, proceeding with talk creation")}catch(I){console.error("Error during reconnection attempt:",I),s.value="Connection failed. Cannot play response.",p.value=!1;return}}if(!o.value||!$.value||!y.value){console.error("Still not connected, cannot create talk."),s.value="Not connected. Cannot play response.",p.value=!1;return}console.log("Client: Creating talk");const J=nt(r.language);if(await it(Y,J,$.value,y.value),console.log("Client: Talk request sent"),f.value&&P.value){console.log("Setting up enhanced talk stream detection"),R.value=!1,g.value=0,T.value&&(clearInterval(T.value),T.value=null);const I=f.value;T.value=setInterval(async()=>{if(!I||I.connectionState!=="connected"){T.value&&(clearInterval(T.value),T.value=null);return}try{const O=I.getReceivers(),M=O.filter(A=>A.track&&A.track.kind==="video"&&A.track.readyState==="live").map(A=>A.track);if(console.log(`Found ${M.length} active video tracks`),M.length>0){const A=await I.getStats();let W=!1,V=0;A.forEach(H=>{if(H.type==="inbound-rtp"&&"mediaType"in H&&H.mediaType==="video"){if(V="bytesReceived"in H?H.bytesReceived:0,W=V>g.value&&V>0,W&&!R.value){console.log("Talk video stream now active with data flow"),R.value=!0;const Me=O.filter(te=>te.track&&te.track.readyState==="live").map(te=>te.track),se=new MediaStream(Me);m(!0,se)}g.value=V}}),!W&&R.value&&!p.value&&(console.log("Talk video stream has no active data flow, reverting to idle"),R.value=!1,m(!1,null))}else R.value&&!p.value&&(console.log("No active video tracks found, reverting to idle"),R.value=!1,m(!1,null))}catch(O){console.error("Error monitoring video stream:",O)}},750);const re=I.getReceivers(),ee=re.filter(O=>O.track&&O.track.kind==="video"&&O.track.readyState==="live").map(O=>O.track);setInterval(()=>{if(ee.length>0){console.log(`Initial check: Found ${ee.length} active video tracks`),ee.forEach(M=>{console.log(`Ensuring video track is enabled: ${M.id}`),M.enabled=!0});const O=re.filter(M=>M.track&&M.track.readyState==="live").map(M=>M.track);try{const M=new MediaStream(O),A=P.value;A&&(!A.srcObject||A.srcObject.getVideoTracks().length===0||A.srcObject.getVideoTracks()[0].readyState!=="live")&&(console.log("Updating video element with active stream"),A.srcObject=M,A.muted=u.value,A.style.display="block",A.play().catch(V=>{console.error("Error playing video:",V),V.name==="NotAllowedError"&&(A.muted=!0,A.play().catch(H=>{console.error("Still cannot play video:",H)}))}))}catch(M){console.error("Error creating media stream:",M)}}},300)}}catch(j){console.error("Client: Error during startTalk:",j),l.push({role:"assistant",content:`Error: ${j.message||"Could not process request."}`}),s.value=`Error: ${j.message||"Could not process request."}`,P.value&&x()}finally{p.value=!1}}},wn=()=>{const[t,l]=k();t.value&&t.value.value.trim()&&l(t.value.value)},_n=t=>{const[l,a]=k();t.key==="Enter"&&l.value&&l.value.value.trim()&&a(l.value.value)},Sn=async t=>{const[l,a,o,s]=k();o.value=!0,l.push({role:"assistant",content:`Procesando grabación de voz en ${Te(a.language)} ${Q[a.language]||"English"}...`});try{const r=await t.arrayBuffer(),i=btoa(new Uint8Array(r).reduce((g,p)=>g+String.fromCharCode(p),""));console.log("Client: Audio converted to base64, size:",i.length),console.log(`Client: Processing voice recording in ${a.language} (${Q[a.language]||"English"})`),l.length>0&&l[l.length-1].role==="assistant"&&l[l.length-1].content.startsWith("Procesando grabación de voz")&&l.pop();const c=await gt(i,t.type,Q[a.language]||"English");c&&!c.startsWith("Error:")?(console.log(`Client: Transcription successful in ${a.language}: "${c}"`),await s(c)):(console.error(`Client: Transcription failed in ${a.language}:`,c),l.push({role:"assistant",content:`No pude procesar correctamente el audio en ${Q[a.language]||"English"}. Por favor, intenta de nuevo o escribe tu mensaje.`}))}catch(r){console.error(`Client: Error processing audio in ${a.language}:`,r),l.length>0&&l[l.length-1].role==="assistant"&&l[l.length-1].content.startsWith("Procesando grabación de voz")&&l.pop();const i=`Lo siento, hubo un problema procesando tu grabación en ${Te(a.language)} ${Q[a.language]}. ${r.message}`;l.push({role:"assistant",content:i})}finally{o.value=!1}},Cn=async()=>{const[t,l,a,o,s,r]=k();if(!l.value)try{const i={audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0,sampleRate:48e3}};console.log(`Client: Starting voice recording for language: ${t.language} (${Q[t.language]||"English"})`);const c=await navigator.mediaDevices.getUserMedia(i);let g="audio/webm;codecs=opus";MediaRecorder.isTypeSupported(g)||(g="audio/webm",console.log("Client: Opus codec not supported, using standard audio/webm"));const p=new MediaRecorder(c,{mimeType:g,audioBitsPerSecond:128e3});o.value=Ve(p);const u=[];p.addEventListener("dataavailable",m=>{u.push(m.data)}),p.addEventListener("stop",async()=>{const m=new Blob(u,{type:p.mimeType});console.log("Found",c.getVideoTracks().length,"active video tracks"),c.getTracks().forEach(f=>f.stop()),l.value=!1,o.value=null,r.value&&clearInterval(r.value),s.value=0,m.size>0?await a(m):console.log("Empty recording, skipping processing.")}),p.start(),l.value=!0,s.value=0,r.value&&clearInterval(r.value),r.value=setInterval(()=>{s.value++},1e3),setTimeout(()=>{p.state==="recording"&&p.stop()},3e4)}catch(i){console.error("Error starting recording:",i),l.value=!1,alert("Could not start recording. Please ensure microphone permission is granted.")}},En=()=>{const[t,l]=k();t.value&&t.value.state==="recording"&&t.value.stop(),l.value&&(clearInterval(l.value),l.value=null)},Tn=()=>{const[t,l,a]=k();t.value?a():l()},An=()=>{var Le,$e,Oe;be(),ve(h(ht,"s_k00z89YFKEE"));const t=mt(),l=b(""),a=b(""),o=b(!1),s=b(!1),r=b(!1),i=b(!1),c=b(null),g=b(!1),p=b(0),u=b(((Le=t.value)==null?void 0:Le.initialThreadId)??crypto.randomUUID()),m=Se([]),f=b(!1),x=Se({userResponse:"",language:(($e=t.value)==null?void 0:$e.initialLanguage)??"en-US"}),y=b(),T=b(),$=b(),E=b(null),R=b(null),P=b(null),U=b(null),j=b(0),Y=b(!1),J=b(null),I=h(on,"s_N9e0IU0A4bo",[s,r,i,E,Y,y]),re=h(cn,"s_Ju0f19q15Rc",[s,r,i,I,y]),ee=h(un,"s_aAUOe9s9Jkk",[E]),O=h(dn,"s_HvRDpFr97uM",[E,a,l]),M=h(gn,"s_EF7Cga3ZMCg",[o,c,J,E]),A=h(pn,"s_MPQKybcKuto",[o,c,E]),W=h(mn,"s_hlWBljykoJs",[E]),V=h(hn,"s_WBCTWzxfig4",[j,r,i,re,E,U,Y,y]),H=h(fn,"s_Y50Opu7cRuk",[o,J,j,A,O,M,ee,W,V,E,I,a,U,l,Y,y]),se=h(yn,"s_F0oEfzF8QA8",[H,o,c,J,h(xn,"s_84iu1gesId0",[H,A,O,M,ee,W,V,E]),s,E,I,a,l]);F(_("s_sXBaPboedo4",[H,se,o,J,I,U,P])),F(_("s_rueDjDgQosU",[m,f,t])),F(_("s_jqWZtbrPWYE",[m,T]));const te=h(bn,"s_ZXBOyQKfLYM",[i,y]),Ct=h(vn,"s_QG1bFHMosqw",[se]),we=h(kn,"s_ir1spm36TUU",[m,se,o,c,x,t,$,j,r,i,re,E,I,a,U,l,u,Y,y]),Et=h(wn,"s_SVXZb4uUvRs",[$,we]),Tt=h(_n,"s_6fbfSHCjrkg",[$,we]),At=h(Tn,"s_dxWeK02kSMA",[g,h(Cn,"s_NCM2QYVvCRs",[x,g,h(Sn,"s_nlB6T0j3ySQ",[m,x,r,we]),R,p,P]),h(En,"s_iZrhr7O0pfk",[R,P])]);return F(_("s_YAGfxIvYiGw")),e("div",null,{class:"chat-container",style:{height:"var(--available-height, 70vh)"}},[e("div",null,{class:"video-panel"},[e("video",{ref:y},{id:"talk-video",autoplay:!0,playsInline:!0,muted:v(w=>w.value,[i],"p0.value"),class:"video-element",preload:"auto"},null,3,null),r.value&&e("div",null,{class:"video-processing-indicator"},[d(he,null,3,"Ba_0"),e("span",null,null,"Processing...",3,null)],1,"Ba_1"),s.value&&e("div",null,{class:"video-connecting-overlay"},[d(he,null,3,"Ba_2"),e("p",null,null,"Connecting to Avatar...",3,null)],1,"Ba_3"),e("div",null,{class:"control-panel"},[e("div",null,{class:"control-left"},e("div",null,{class:"language-icons"},ue.map(w=>e("button",{class:`lang-icon-btn ${x.language===w.value?"active":""}`,title:D(w,"label"),"aria-label":D(w,"label"),dangerouslySetInnerHTML:D(w,"flagSvg"),onClick$:_("s_zgjxndRmwSE",[x,t,w])},null,null,2,w.value)),1,null),1,null),e("div",null,{class:"control-right"},!o.value&&!s.value&&e("button",null,{class:"connect-button",onClick$:Ct},"Connect",3,"Ba_4"),1,null)],1,null)],1,null),e("div",null,{class:"chat-panel"},[e("div",{ref:T},{class:"chat-messages"},[m.map((w,X)=>e("div",{class:`message-container ${w.role==="user"?"user-message":"assistant-message"}`},null,e("div",{class:`message-bubble ${w.role==="user"?"user-bubble":"assistant-bubble"}`},null,[e("div",null,{class:"message-sender"},w.role==="user"?"You":"Assistant",1,null),e("p",null,{class:"message-content"},D(w,"content"),1,null)],1,null),1,X)),r.value&&((Oe=m[m.length-1])==null?void 0:Oe.role)==="user"&&e("div",null,{class:"message-container assistant-message"},e("div",null,{class:"message-bubble assistant-bubble"},[e("div",null,{class:"message-sender"},"Assistant",3,null),e("div",null,{class:"typing-indicator"},[e("span",null,null,null,3,null),e("span",null,null,null,3,null),e("span",null,null,null,3,null)],3,null)],3,null),3,"Ba_5")],1,null),e("div",null,{class:"chat-input-container fixed-mobile-input"},e("div",null,{class:"chat-input-wrapper"},[e("button",null,{class:"volume-button control-btn","aria-label":v(w=>w.value?"Unmute Video":"Mute Video",[i],'p0.value?"Unmute Video":"Mute Video"'),onClick$:te},i.value?d(tl,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_6"):d(el,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_7"),1,null),e("div",null,{class:"language-icons desktop-only"},ue.map(w=>e("button",{class:`lang-icon-btn ${x.language===w.value?"active":""}`,title:D(w,"label"),"aria-label":D(w,"label"),dangerouslySetInnerHTML:D(w,"flagSvg"),onClick$:_("s_C6PrDmqOBSo",[x,t,w])},null,null,2,w.value)),1,null),e("button",null,{disabled:v((w,X)=>w.value||X.value,[s,r],"p0.value||p1.value"),class:v(w=>`mic-button ${w.value?"recording":""}`,[g],'`mic-button ${p0.value?"recording":""}`'),"aria-label":v(w=>w.value?"Stop Recording":"Start Recording",[g],'p0.value?"Stop Recording":"Start Recording"'),onClick$:At},g.value?d(Xt,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_8"):d(Wt,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_9"),1,null),e("input",{ref:$},{type:"text",placeholder:v(w=>w.value?"Connecting...":"Type a message...",[s],'p0.value?"Connecting...":"Type a message..."'),disabled:v((w,X)=>w.value||X.value,[s,r],"p0.value||p1.value"),class:"chat-input",onKeyUp$:Tt},null,3,null),e("button",null,{disabled:v((w,X)=>w.value||X.value,[s,r],"p0.value||p1.value"),class:"send-button",onClick$:Et},r.value?d(he,{size:"small",[n]:{size:n}},3,"Ba_10"):d(We,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_11"),1,null)],1,null),1,null)],1,null)],1,"Ba_12")},In=L(h(An,"s_MrD3ZY10mAo")),Rn=t=>{const l=(t.size??"medium")==="small"?"w-4 h-4 border-2":"w-5 h-5 border-[3px]";return e("div",{class:`animate-spin rounded-full ${l} border-white border-t-transparent`},{role:"status","aria-label":"loading"},null,3,"Ba_13")},he=L(h(Rn,"s_0l795rBK8oI")),ht=`
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes bubble-appear {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-bubble-appear {
  animation: bubble-appear 0.3s ease forwards;
}

.typing-indicator span {
  width: 5px;
  height: 5px;
  background-color: currentColor;
  border-radius: 50%;
  display: inline-block;
  margin: 0 1px;
  animation: typing-bounce 1.2s infinite ease-in-out;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}
.animate-pulse {
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
}

/* Custom scrollbar (optional) */
/* Ensure the app takes exactly the viewport size */
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
}

/* Estilos CSS para el nuevo diseño limpio y minimalista */
/* Base Styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Main Container */
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f8f9fa;
  overflow: hidden;
}

/* Video Panel */
.video-panel {
  width: 100%;
  position: relative;
  height: var(--video-height, 40vh);
  background-color: #000;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.control-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: rgba(255, 255, 255, 0.9);
}

.control-left, .control-right {
  display: flex;
  align-items: center;
}

/* Adjust language icons in control panel for mobile */
.control-left .language-icons {
  display: flex;
  gap: 4px;
}

.volume-button {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #eaeaea;
  border: none;
  margin-right: 10px;
  cursor: pointer;
}

.language-selector {
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background-color: white;
  font-size: 14px;
}

.connect-button {
  padding: 6px 16px;
  background-color: #0cd15b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

/* Chat Panel */
.chat-panel {
  flex-grow: 1;
  height: var(--chat-height, 50vh);
  background-color: white;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 12px 16px;
  background-color: #f1f1f4;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header-info {
  display: flex;
  flex-direction: column;
}

.chat-title {
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.chat-subtitle {
  font-size: 12px;
  color: #666;
  margin-top: 3px;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-container {
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  animation: bubble-appear 0.2s ease-out;
}

.user-bubble {
  background-color: #1a85ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant-bubble {
  background-color: #f1f1f4;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-sender {
  font-size: 11px;
  margin-bottom: 4px;
  opacity: 0.8;
  font-weight: 500;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Input Area */
.chat-input-container {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
}

/* Fixed Mobile Input */
.fixed-mobile-input {
  position: relative;
}

/* Fixed position for mobile */
@media (max-width: 767px) {
  .fixed-mobile-input {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #f8f9fa;
    padding: 10px 16px;
    z-index: 20;
    border-top: 1px solid #e0e0e0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  }
  
  /* Add padding at the bottom of chat messages to prevent overlap with fixed input */
  .chat-messages {
    padding-bottom: 70px !important;
  }
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  background-color: white;
  width: 100%;
  border-radius: 24px;
  border: 1px solid #e0e0e0;
  padding: 0 6px;
  height: 42px;
}

.control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.mic-button {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.language-icons {
  display: flex;
  gap: 2px;
  margin: 0 2px;
}

/* This space intentionally left blank - removing obsolete CSS */

.lang-icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.2s ease;
}

/* Control panel language icons should be slightly smaller */
.control-left .lang-icon-btn {
  width: 34px;
  height: 24px;
  border-radius: 3px;
}

.lang-icon-btn:hover {
  transform: scale(1.05);
}

.lang-icon-btn.active {
  box-shadow: 0 0 0 2px #1a85ff, 0 0 0 4px rgba(26, 133, 255, 0.3);
}

/* SVG flag styling */
.lang-icon-btn svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mic-button.recording {
  color: #f44336;
  animation: pulse 1.5s infinite;
}

.chat-input {
  flex-grow: 1;
  height: 100%;
  border: none;
  padding: 0 8px;
  font-size: 14px;
}

.chat-input:focus {
  outline: none;
}

.send-button {
  min-width: 32px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a85ff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

/* Loading and Status Indicators */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #888;
  animation: typing 1.4s infinite both;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.video-processing-indicator {
  position: absolute;
  right: 10px;
  bottom: 60px;
  background-color: rgba(0,0,0,0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.video-connecting-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 10px;
}

/* Animations */
@keyframes bubble-appear {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

@keyframes typing {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}
/* Responsive Adjustments */
@media (min-width: 768px) {
  .chat-container {
    flex-direction: row;
  }
  
  .video-panel {
    width: 40%;
    height: var(--available-height, 90vh);
  }
  
  .chat-panel {
    width: 60%;
    height: var(--available-height, 100vh);
  }
  
  .control-panel {
    height: 40px;
  }
  
  .chat-input-wrapper {
    max-width: 90%;
    margin: 0 auto;
  }
  
  /* Reset fixed position for desktop */
  .fixed-mobile-input {
    position: relative;
    box-shadow: none;
  }
  
  /* Show language icons in input area only on desktop */
  .desktop-only {
    display: flex;
  }
}

/* Hide on mobile */
.desktop-only {
  display: none;
}

/* Hide scrollbars but maintain functionality */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
  overflow: hidden;
}

/* Hide scrollbars on main layout */
.h-screen.w-screen.max-w-full {
  overflow: hidden;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 3px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .overflow-y-auto::-webkit-scrollbar {
    width: 3px;
  }
}
`,Mn=Object.freeze(Object.defineProperty({__proto__:null,STYLES:ht,Spinner:he,_auto_DID_API_URL:ne,_auto_MAX_CONTEXT_MESSAGES:ye,_auto_fetchWithRetries:K,_auto_getAuthHeader:ae,_auto_getLanguageCode:Te,_auto_getVoiceSettings:nt,_auto_languageMap:Q,_auto_languages:ue,_auto_processTextForVoice:at,_auto_serverCloseStream:ct,_auto_serverCreateTalk:it,_auto_serverFetchLangChainResponse:dt,_auto_serverInitConnection:rt,_auto_serverProcessAudio:gt,_auto_serverSaveChatMessage:pt,_auto_serverSendIceCandidate:ot,_auto_serverSendSdpAnswer:st,_auto_serverUpdateUserLang:an,_auto_trimChatHistory:ut,default:In,useInitialData:mt},Symbol.toStringTag,{value:"Module"})),Ln=()=>e("div",null,{class:"min-h-screen bg-gray-50 dark:bg-gray-900"},[e("section",null,{class:"py-12 px-4 sm:px-6 text-center bg-gradient-to-r from-teal-500/10 to-green-500/10 dark:from-teal-900/30 dark:to-green-900/30"},e("div",null,{class:"max-w-3xl mx-auto"},[e("h1",null,{class:"text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"},"Our Language Courses",3,null),e("p",null,{class:"mt-4 text-lg text-gray-600 dark:text-gray-300"},"Discover a wide range of language courses designed to help you achieve fluency through personalized learning.",3,null)],3,null),3,null),e("section",null,{class:"py-6 px-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"},e("div",null,{class:"max-w-7xl mx-auto flex justify-center"},e("div",null,{class:"inline-flex rounded-md shadow-sm",role:"group"},[e("button",null,{class:"px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-l-lg dark:bg-teal-900 dark:text-teal-300"},"All Courses",3,null),e("button",null,{class:"px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"},"Beginner",3,null),e("button",null,{class:"px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-200 rounded-r-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"},"Advanced",3,null)],3,null),3,null),3,null),e("section",null,{class:"py-12 px-4 sm:px-6"},e("div",null,{class:"max-w-7xl mx-auto"},e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"},[{id:1,title:"English for Beginners",level:"A1 - Beginner",duration:"8 weeks",description:"Start your English journey with this comprehensive beginner course. Learn essential vocabulary, basic grammar, and everyday phrases.",image:"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",instructor:"Sarah Johnson"},{id:2,title:"Intermediate Spanish",level:"B1 - Intermediate",duration:"10 weeks",description:"Take your Spanish to the next level with our intermediate course focused on conversation, advanced grammar, and cultural context.",image:"https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",instructor:"Carlos Mendez"},{id:3,title:"Business French",level:"B2 - Upper Intermediate",duration:"6 weeks",description:"Specialized course for professionals looking to use French in business contexts. Focus on formal communication and industry vocabulary.",image:"https://images.unsplash.com/photo-1549737221-bef65e2604a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",instructor:"Marie Dupont"},{id:4,title:"Conversational Italian",level:"A2 - Elementary",duration:"8 weeks",description:"Practice speaking Italian in everyday situations. Learn practical phrases, improve pronunciation, and gain confidence in real conversations.",image:"https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",instructor:"Marco Bianchi"}].map(l=>e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col h-full transform transition-transform hover:scale-105 hover:shadow-lg"},[e("div",null,{class:"h-48 overflow-hidden"},e("img",{src:D(l,"image"),alt:D(l,"title")},{class:"w-full h-full object-cover"},null,3,null),1,null),e("div",null,{class:"p-6 flex-grow"},[e("div",null,{class:"flex justify-between items-start mb-2"},[e("span",null,{class:"px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs font-medium rounded"},D(l,"level"),1,null),e("span",null,{class:"flex items-center text-xs text-gray-500 dark:text-gray-400"},[d(Vt,{class:"h-3.5 w-3.5 mr-1",[n]:{class:n}},3,"DL_0"),D(l,"duration")],1,null)],1,null),e("h3",null,{class:"text-lg font-bold text-gray-900 dark:text-white mb-2"},D(l,"title"),1,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 text-sm mb-4"},D(l,"description"),1,null),e("div",null,{class:"flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4"},[d(Z,{class:"h-4 w-4 mr-1",[n]:{class:n}},3,"DL_1"),"Instructor: ",D(l,"instructor")],1,null)],1,null),e("div",null,{class:"px-6 pb-4"},e("button",null,{class:"w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow transition-colors flex items-center justify-center"},["Enroll Now",d(Re,{class:"ml-2 h-4 w-4",[n]:{class:n}},3,"DL_2")],1,null),1,null)],1,l.id)),1,null),1,null),1,null),e("section",null,{class:"py-12 px-4 sm:px-6 bg-gray-100 dark:bg-gray-800"},e("div",null,{class:"max-w-7xl mx-auto text-center"},[e("h2",null,{class:"text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8"},"Why Learn With Us?",3,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-3 gap-6"},[e("div",null,{class:"p-6 bg-white dark:bg-gray-700 rounded-xl shadow"},[e("div",null,{class:"w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4"},d(ie,{class:"h-6 w-6 text-teal-600 dark:text-teal-400",[n]:{class:n}},3,"DL_3"),1,null),e("h3",null,{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2"},"Expert-Designed Curriculum",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Our courses are crafted by language experts to ensure effective learning and retention.",3,null)],1,null),e("div",null,{class:"p-6 bg-white dark:bg-gray-700 rounded-xl shadow"},[e("div",null,{class:"w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4"},d(ce,{class:"h-6 w-6 text-teal-600 dark:text-teal-400",[n]:{class:n}},3,"DL_4"),1,null),e("h3",null,{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2"},"Community Practice",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Join conversation groups with fellow learners to practice in a supportive environment.",3,null)],1,null),e("div",null,{class:"p-6 bg-white dark:bg-gray-700 rounded-xl shadow"},[e("div",null,{class:"w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4"},d(Z,{class:"h-6 w-6 text-teal-600 dark:text-teal-400",[n]:{class:n}},3,"DL_5"),1,null),e("h3",null,{class:"text-lg font-semibold text-gray-900 dark:text-white mb-2"},"Personalized Learning",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Adaptive lessons that adjust to your pace and learning style for maximum progress.",3,null)],1,null)],1,null)],1,null),1,null),e("section",null,{class:"py-12 px-4 sm:px-6 bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-800 dark:to-green-800"},e("div",null,{class:"max-w-3xl mx-auto text-center"},[e("h2",null,{class:"text-3xl font-bold text-white mb-4"},"Ready to Start Your Language Journey?",3,null),e("p",null,{class:"text-teal-100 mb-8"},"Join thousands of students already improving their language skills.",3,null),e("div",null,{class:"flex flex-wrap justify-center gap-4"},[d(S,{href:"/auth",class:"px-6 py-3 bg-white text-teal-600 font-medium rounded-lg shadow-lg hover:bg-teal-50 transition-colors",children:"Sign Up Now",[n]:{href:n,class:n}},3,"DL_6"),d(S,{href:"/chat",class:"px-6 py-3 bg-teal-700 text-white font-medium rounded-lg shadow-lg hover:bg-teal-800 transition-colors",children:"Try Free Chat Practice",[n]:{href:n,class:n}},3,"DL_7")],1,null)],1,null),1,null)],1,"DL_8"),$n=L(h(Ln,"s_z0URBq6vKT0")),On={title:"Courses - Move On Academy",meta:[{name:"description",content:"Browse our wide range of language courses for all levels. From beginner to advanced, find the perfect course to enhance your language skills."}]},Pn=Object.freeze(Object.defineProperty({__proto__:null,default:$n,head:On},Symbol.toStringTag,{value:"Module"})),Un=t=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:v(l=>l.class||"w-5 h-5",[t],'p0.class||"w-5 h-5"')},[e("polyline",null,{points:"16 18 22 12 16 6"},null,3,null),e("polyline",null,{points:"8 6 2 12 8 18"},null,3,null)],3,"Hi_0"),fe=L(h(Un,"s_8P7p3IpX6Fs")),jn=t=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:v(l=>l.class||"w-5 h-5",[t],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"1",y:"4",width:"22",height:"16",rx:"2",ry:"2"},null,3,null),e("line",null,{x1:"1",y1:"10",x2:"23",y2:"10"},null,3,null)],3,"Hi_3"),ft=L(h(jn,"s_TB03ynRd0Wg")),Dn=t=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:v(l=>l.class||"w-5 h-5",[t],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"4",y:"2",width:"16",height:"20",rx:"2",ry:"2"},null,3,null),e("line",null,{x1:"9",y1:"6",x2:"15",y2:"6"},null,3,null),e("line",null,{x1:"9",y1:"10",x2:"15",y2:"10"},null,3,null),e("line",null,{x1:"9",y1:"14",x2:"15",y2:"14"},null,3,null)],3,"Hi_4"),xt=L(h(Dn,"s_2vNnYhGWGdw")),Nn=t=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:v(l=>l.class||"w-5 h-5",[t],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"},null,3,null),e("path",null,{d:"M7 11V7a5 5 0 0 1 10 0v4"},null,3,null)],3,"Hi_5"),yt=L(h(Nn,"s_z2RZqqZkmR4")),Bn=t=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:v(l=>l.class||"w-5 h-5",[t],'p0.class||"w-5 h-5"')},[e("ellipse",null,{cx:"12",cy:"5",rx:"9",ry:"3"},null,3,null),e("path",null,{d:"M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"},null,3,null),e("path",null,{d:"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"},null,3,null)],3,"Hi_6"),bt=L(h(Bn,"s_0s3q0rsbMcs")),Fn=`
    .code-block {
      @apply bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 overflow-x-auto font-mono text-sm;
      position: relative;
    }
    
    .copy-button {
      @apply absolute top-2 right-2 p-2 bg-indigo-500 text-white rounded opacity-0 transition-opacity;
    }
    
    .code-block:hover .copy-button {
      @apply opacity-100;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .tab {
      @apply px-4 py-2 text-gray-600 dark:text-gray-400 cursor-pointer transition-colors;
    }
    
    .tab.active {
      @apply text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-medium;
    }
    
    .section {
      @apply opacity-0;
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      transform: translateY(20px);
    }
    
    .section.visible {
      @apply opacity-100;
      transform: translateY(0);
    }
    
    .toc-link {
      @apply block py-2 px-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors;
    }
    
    .diagram-box {
      @apply border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 relative;
      min-height: 100px;
    }
    
    .diagram-arrow {
      @apply absolute border-t-2 border-indigo-300 dark:border-indigo-700;
      width: 40px;
      transform: translateY(-50%);
    }
    
    .diagram-arrow::after {
      content: '';
      @apply absolute h-3 w-3 border-t-2 border-r-2 border-indigo-300 dark:border-indigo-700 transform rotate-45;
      right: -1px;
      top: -7px;
    }
    
    .snippet-tag {
      @apply inline-flex text-xs font-medium px-2 py-1 rounded-md;
    }
    
    .animated-bg {
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }
    
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .toc-link.active {
      @apply bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium;
    }
  `,zn=t=>{const[l]=k();l.value=t},Hn=t=>{const[l]=k();l.value=t;const a=document.getElementById(t);a&&a.scrollIntoView({behavior:"smooth",block:"start"})},Vn=()=>{ve(h(Fn,"s_uYBjZvZkxow"));const t=b("architecture"),l=b("arch-overview"),a=b(),o=b(),s=b(),r=h(zn,"s_85Fk8Ri0Dl8",[t]),i=h(Hn,"s_Yh9AXSXas0Q",[l]);return F(_("s_JwNEufPc0dE")),e("div",null,{class:"flex flex-col min-h-screen bg-white dark:bg-gray-900"},[e("div",null,{class:"bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-16 px-4"},e("div",null,{class:"max-w-5xl mx-auto"},[e("h1",null,{class:"text-4xl md:text-5xl font-extrabold mb-4"},"Documentación Técnica",3,null),e("p",null,{class:"text-xl text-indigo-100 max-w-3xl"},"Guía completa de la plataforma TokenEstate para desarrolladores, arquitectos y usuarios técnicos",3,null)],3,null),3,null),e("div",null,{class:"max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8"},[e("div",null,{class:"md:w-64 flex-shrink-0"},e("div",null,{class:"sticky top-8"},[e("div",null,{class:"p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6"},[e("h3",null,{class:"font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200"},"Contenido",3,null),e("nav",null,{class:"space-y-1"},[e("a",null,{href:"#arch-overview",class:v(c=>`toc-link ${c.value==="arch-overview"?"active":""}`,[l],'`toc-link ${p0.value==="arch-overview"?"active":""}`'),onClick$:_("s_0Sd7oecTTOI",[i])},"Arquitectura",3,null),e("a",null,{href:"#system-layers",class:v(c=>`toc-link ${c.value==="system-layers"?"active":""}`,[l],'`toc-link ${p0.value==="system-layers"?"active":""}`'),onClick$:_("s_F2UsykvfDcU",[i])},"Capas del Sistema",3,null),e("a",null,{href:"#smart-contracts",class:v(c=>`toc-link ${c.value==="smart-contracts"?"active":""}`,[l],'`toc-link ${p0.value==="smart-contracts"?"active":""}`'),onClick$:_("s_KEqv48ErNIg",[i])},"Contratos Inteligentes",3,null),e("a",null,{href:"#security",class:v(c=>`toc-link ${c.value==="security"?"active":""}`,[l],'`toc-link ${p0.value==="security"?"active":""}`'),onClick$:_("s_SF0LrlyNP5s",[i])},"Seguridad y Auditoría",3,null),e("a",null,{href:"#timeline",class:v(c=>`toc-link ${c.value==="timeline"?"active":""}`,[l],'`toc-link ${p0.value==="timeline"?"active":""}`'),onClick$:_("s_bDXXA45JnUE",[i])},"Cronograma",3,null)],3,null)],3,null),e("div",null,{class:"p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"},[e("h3",null,{class:"font-semibold text-lg mb-3 text-indigo-800 dark:text-indigo-300"},"Recursos",3,null),e("ul",null,{class:"space-y-2 text-sm"},[e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"📄",3,null)," Whitepaper técnico"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"💻",3,null)," Repositorio de código"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"🧪",3,null)," Testnet Demo"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"💬",3,null)," Canal de Discord"],3,null),3,null)],3,null)],3,null)],3,null),3,null),e("div",null,{class:"flex-1"},[e("div",null,{class:"border-b border-gray-200 dark:border-gray-700 mb-8"},e("div",null,{class:"flex"},[e("button",null,{class:v(c=>`tab ${c.value==="architecture"?"active":""}`,[t],'`tab ${p0.value==="architecture"?"active":""}`'),onClick$:_("s_Tb896FU2TvI",[r])},"Arquitectura",3,null),e("button",null,{class:v(c=>`tab ${c.value==="contracts"?"active":""}`,[t],'`tab ${p0.value==="contracts"?"active":""}`'),onClick$:_("s_jAmpfQOwVW8",[r])},"Contratos",3,null),e("button",null,{class:v(c=>`tab ${c.value==="security"?"active":""}`,[t],'`tab ${p0.value==="security"?"active":""}`'),onClick$:_("s_x0ZhfQ6FRlE",[r])},"Seguridad",3,null),e("button",null,{class:v(c=>`tab ${c.value==="implementation"?"active":""}`,[t],'`tab ${p0.value==="implementation"?"active":""}`'),onClick$:_("s_1RvbHfL96oo",[r])},"Implementación",3,null)],3,null),3,null),e("div",null,{class:v(c=>`tab-content ${c.value==="architecture"?"active":""}`,[t],'`tab-content ${p0.value==="architecture"?"active":""}`')},[e("section",{ref:a},{id:"arch-overview",class:"mb-12 section"},[e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Arquitectura del Sistema",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"La plataforma TokenEstate está diseñada con una arquitectura modular y escalable que permite la tokenización, comercialización y gestión de propiedades inmobiliarias a través de tecnología blockchain. Esta sección describe la arquitectura general y los componentes clave del sistema.",3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Componentes Principales",3,null),e("div",null,{class:"grid md:grid-cols-2 gap-6"},[e("div",null,null,[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"Frontend",3,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Aplicación web desarrollada con Qwik y React",3,null),e("li",null,null,"Interfaz para usuarios, propietarios y administradores",3,null),e("li",null,null,"Integración con billeteras Web3",3,null)],3,null)],3,null),e("div",null,null,[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"Blockchain",3,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Implementado sobre red EVM-compatible",3,null),e("li",null,null,"Smart Contracts para tokens NFT (propiedades)",3,null),e("li",null,null,"Smart Contracts para tokens KNRT (pagos)",3,null)],3,null)],3,null),e("div",null,{class:"border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[d(bt,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"Hi_9"),"Backend"],1,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"API REST para metadatos y funciones auxiliares",3,null),e("li",null,null,"Base de datos SQL para información no-blockchain",3,null),e("li",null,null,"Servicios de autenticación y verificación",3,null)],3,null),e("div",null,{class:"snippet-tag bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"},"TursoDb & Node.js",3,null)],1,null),e("div",null,{class:"border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[d(fe,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"Hi_10"),"Integración"],1,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Oráculos blockchain (Chainlink)",3,null),e("li",null,null,"IPFS para almacenamiento descentralizado",3,null),e("li",null,null,"Servicios KYC y verificación legal",3,null)],3,null),e("div",null,{class:"snippet-tag bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"},"Integraciones API",3,null)],1,null)],1,null),e("div",null,{class:"mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"},[e("h4",null,{class:"font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"},"Tecnologías Clave",3,null),e("div",null,{class:"flex flex-wrap gap-2"},[e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"Solidity",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"Qwik.js",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"ERC721",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"ERC20",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"IPFS",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"TursoDb",3,null)],3,null)],3,null)],1,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Flujo de Datos",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"El flujo de datos entre los componentes del sistema sigue un patrón de comunicación asíncrono con verificaciones en múltiples niveles para garantizar la integridad y consistencia:",3,null),e("ol",null,{class:"list-decimal pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("strong",null,null,"Solicitud de usuario",3,null),": Iniciada desde la interfaz frontend"],3,null),e("li",null,null,[e("strong",null,null,"Validación local",3,null),": Verificación preliminar en el cliente"],3,null),e("li",null,null,[e("strong",null,null,"API Backend",3,null),": Procesamiento y preparación de transacciones"],3,null),e("li",null,null,[e("strong",null,null,"Firma de transacción",3,null),": Usuario firma con su billetera Web3"],3,null),e("li",null,null,[e("strong",null,null,"Procesamiento blockchain",3,null),": Transacción procesada por smart contracts"],3,null),e("li",null,null,[e("strong",null,null,"Confirmación",3,null),": Resultados verificados y notificados al usuario"],3,null)],3,null)],3,null)],1,null),e("section",{ref:o},{id:"system-layers",class:"mb-12 section"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Capas del Sistema",3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"1. Capa de Blockchain",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("p",null,{class:"text-gray-700 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Red:",3,null)," Ethereum o red EVM-compatible (como Base) para optimizar costos de transacción."],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Esta capa proporciona la infraestructura descentralizada sobre la que se ejecutan los contratos inteligentes. Se accede a través de nodos RPC y se monitorea mediante servicios de indexación para un rendimiento óptimo.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"2. Capa de Smart Contracts",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato ERC721:",3,null)," Tokenización y registro de inmuebles."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato ERC20:",3,null)," Gestión del token de pago KNRT."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato Marketplace:",3,null)," Listado, compra/venta y transferencia de NFTs."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato de Alquiler:",3,null)," Gestión de contratos de arrendamiento."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato de Escrow:",3,null)," Bloqueo y liberación de tokens según condiciones."],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Los contratos inteligentes están implementados en Solidity v0.8.22 o superior, con un enfoque en la seguridad, eficiencia de gas y facilidad de actualización. Siguen patrones establecidos como proxy actualizable y control de acceso basado en roles.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"3. Capa de Interfaz de Usuario",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Frontend:",3,null)," Aplicación web desarrollada en Qwik.js"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Integración Web3:",3,null)," Ethers.js para interactuar con la blockchain"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"La interfaz de usuario está diseñada para ser intuitiva y responsiva, con soporte para múltiples billeteras y optimización para dispositivos móviles y de escritorio. Implementa principios de diseño centrado en el usuario y accesibilidad.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"4. Capa de Backend",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Servidores:",3,null)," Node.js para API y servicios auxiliares"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Base de datos:",3,null)," SQL para almacenamiento estructurado"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"IPFS:",3,null)," Almacenamiento descentralizado para metadatos"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"La capa de backend gestiona operaciones que requieren procesamiento fuera de la cadena, como la generación de metadatos, el almacenamiento de documentos legales y la indexación para búsquedas eficientes de propiedades.",3,null)],3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"5. Integraciones Adicionales",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Oráculos:",3,null)," Chainlink para validar condiciones externas"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"KYC/AML:",3,null)," Servicios de verificación de identidad"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Pasarelas de Pago:",3,null)," Integración fiat-cripto (opcional)"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Estas integraciones extienden la funcionalidad del sistema, permitiendo una conexión segura con sistemas externos y cumplimiento de requisitos regulatorios.",3,null)],3,null)],3,null),e("section",{ref:s},{id:"smart-contracts",class:"mb-12 section"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Contratos Inteligentes",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"Los contratos inteligentes son el núcleo de la plataforma TokenEstate, proporcionando la lógica de negocio descentralizada que permite la tokenización y gestión de propiedades inmobiliarias. Están desarrollados en Solidity y siguen las mejores prácticas de seguridad y optimización.",3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center"},[d(fe,{class:"w-5 h-5 mr-2 text-indigo-500",[n]:{class:n}},3,"Hi_11"),"Estructura de Contratos"],1,null),e("div",null,{class:"grid md:grid-cols-2 gap-6 mb-6"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-blue-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"PropertyNFT.sol",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Contrato ERC721 para tokenización de propiedades inmobiliarias",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Registro de propiedades con metadatos",3,null),e("li",null,null,"Sistema de verificación de autenticidad",3,null),e("li",null,null,"Actualización controlada de metadatos",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-green-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[d(ft,{class:"w-4 h-4 mr-2",[n]:{class:n}},3,"Hi_12")," KNRT.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Token ERC20 utilizado para pagos en la plataforma",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Transferencias con permisos específicos",3,null),e("li",null,null,"Funciones de congelamiento para escrow",3,null),e("li",null,null,"Controles anti-inflación",3,null)],3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-yellow-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[d(yt,{class:"w-4 h-4 mr-2",[n]:{class:n}},3,"Hi_13")," Marketplace.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Facilita la compra/venta de PropertyNFTs",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Listado de propiedades con precios",3,null),e("li",null,null,"Funciones de oferta y contraoferta",3,null),e("li",null,null,"Comisiones configurables",3,null)],3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-purple-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[d(xt,{class:"w-4 h-4 mr-2",[n]:{class:n}},3,"Hi_14")," RentalManager.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Gestión de contratos de alquiler para propiedades",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Creación de acuerdos de arrendamiento",3,null),e("li",null,null,"Programación de pagos periódicos",3,null),e("li",null,null,"Gestión de disputas y terminación",3,null)],3,null)],1,null)],1,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center"},[d(fe,{class:"w-5 h-5 mr-2 text-indigo-500",[n]:{class:n}},3,"Hi_15"),"Ejemplo de Código: PropertyNFT.sol"],1,null),e("div",null,{class:"code-block"},[e("button",null,{class:"copy-button"},"Copiar",3,null),e("pre",null,null,`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PropertyNFT
 * @dev ERC721 token representing unique real estate properties.
 * Metadata URI should point to detailed property information (potentially on IPFS).
 */
contract PropertyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, AccessControl, ERC721Burnable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant METADATA_UPDATER_ROLE = keccak256("METADATA_UPDATER_ROLE");

    uint256 private _nextTokenId;

    // --- Events ---
    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event TokenMetadataUpdated(uint256 indexed tokenId, string newUri);

    // Funciones y lógica contractual...
}`,3,null)],3,null)],1,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Próximos Pasos para Despliegue",3,null),e("ol",null,{class:"list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2"},[e("li",null,null,"Despliegue de tokens ERC721 para representación de propiedades.",3,null),e("li",null,null,"Despliegue del token KNRT (ERC20) para pagos en la plataforma.",3,null),e("li",null,null,"Despliegue de contrato RentalEscrow para gestión de garantías.",3,null),e("li",null,null,"Despliegue de Marketplace para compra/venta de propiedades.",3,null),e("li",null,null,"Configuración de roles y permisos en cada contrato.",3,null),e("li",null,null,"Auditoría de seguridad completa antes del lanzamiento en mainnet.",3,null)],3,null)],3,null)],1,null)],1,null),e("section",null,{id:"security",class:"mb-12"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Seguridad y Auditoría",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"La seguridad es una prioridad crítica en la plataforma TokenEstate. Se implementan múltiples capas de seguridad y procesos de auditoría rigurosos para proteger los activos y datos de los usuarios.",3,null),e("div",null,{class:"grid md:grid-cols-2 gap-6 mb-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md"},[e("h3",null,{class:"text-xl font-semibold mb-3 text-gray-800 dark:text-white"},"Seguridad de Smart Contracts",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Auditorías por firmas especializadas",3,null),e("li",null,null,"Tests de penetración y análisis estático",3,null),e("li",null,null,"Control de acceso basado en roles",3,null),e("li",null,null,"Patrones de diseño seguros (Checks-Effects-Interactions)",3,null),e("li",null,null,"Implementación gradual con pausas de emergencia",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md"},[e("h3",null,{class:"text-xl font-semibold mb-3 text-gray-800 dark:text-white"},"Seguridad de Aplicación",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Autenticación multifactor",3,null),e("li",null,null,"Conexiones cifradas (HTTPS/TLS)",3,null),e("li",null,null,"Validación de entradas en frontend y backend",3,null),e("li",null,null,"Protección contra ataques comunes (XSS, CSRF)",3,null),e("li",null,null,"Monitoreo y alertas en tiempo real",3,null)],3,null)],3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Proceso de Auditoría",3,null),e("ol",null,{class:"list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2"},[e("li",null,null,[e("strong",null,null,"Auditoría Interna:",3,null)," Revisión de código por el equipo de desarrollo."],3,null),e("li",null,null,[e("strong",null,null,"Auditoría Comunitaria:",3,null)," Programa de recompensas para encontrar vulnerabilidades."],3,null),e("li",null,null,[e("strong",null,null,"Auditoría Profesional:",3,null)," Contratación de firmas especializadas en seguridad blockchain."],3,null),e("li",null,null,[e("strong",null,null,"Testnet Público:",3,null)," Despliegue en redes de prueba para validación amplia."],3,null),e("li",null,null,[e("strong",null,null,"Despliegue Mainnet:",3,null)," Lanzamiento progresivo con límites y monitoreo continuo."],3,null)],3,null)],3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Gestión de Riesgos",3,null),e("div",null,{class:"overflow-x-auto"},e("table",null,{class:"min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"},[e("thead",null,null,e("tr",null,{class:"bg-gray-50 dark:bg-gray-700 text-left"},[e("th",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200"},"Escenario",3,null),e("th",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200"},"Medidas de Mitigación",3,null)],3,null),3,null),e("tbody",null,null,[e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Impago de alquiler",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Garantías en escrow, ejecución automática por contrato",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Disputa contractual",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Sistema de resolución con árbitros designados",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Fallo en oráculo",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Múltiples fuentes de datos, mecanismo de fallback",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Vulnerabilidad en contrato",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Pausa de emergencia, actualizaciones por proxy",3,null)],3,null)],3,null)],3,null),3,null)],3,null)],3,null),e("section",null,{id:"timeline",class:"mb-12"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Cronograma y Estimación de Tiempos",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"El desarrollo e implementación de la plataforma TokenEstate seguirá un enfoque iterativo, con fases bien definidas y entregables específicos para cada etapa.",3,null),e("div",null,{class:"overflow-x-auto mb-8"},e("table",null,{class:"min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"},[e("thead",null,null,e("tr",null,{class:"bg-indigo-50 dark:bg-indigo-900/30"},[e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Fase",3,null),e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Actividades",3,null),e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Duración",3,null)],3,null),3,null),e("tbody",null,null,[e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"1. Diseño y Planificación",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Arquitectura, especificaciones técnicas, planificación de sprints",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"2 - 3 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"2. Desarrollo de Smart Contracts",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Implementación, pruebas unitarias, auditoría interna",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"8 - 12 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"3. Desarrollo Frontend/Backend",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Interfaz de usuario, API, integración Web3",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"4 - 6 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"4. Integración y Testing",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Pruebas de integración, testnet público",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"2 - 3 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"5. Auditoría de Seguridad",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Auditoría externa, correcciones, validación final",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"3 - 4 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"6. Despliegue y Launch",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Mainnet, monitoreo, lanzamiento público",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"1 semana",3,null)],3,null),e("tr",null,{class:"bg-indigo-50 dark:bg-indigo-900/20"},[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200"},"Total Estimado",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700"},null,3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200"},"20 - 29 semanas",3,null)],3,null)],3,null)],3,null),3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Hitos Clave",3,null),e("ul",null,{class:"list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"MVP en Testnet:",3,null)," Semana 14 - Funcionalidades básicas operativas"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Beta Pública:",3,null)," Semana 18 - Versión preliminar para testers seleccionados"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Auditoría Completa:",3,null)," Semana 24 - Finalización de auditorías de seguridad"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Launch en Mainnet:",3,null)," Semana 26-29 - Despliegue en red principal"],3,null)],3,null)],3,null)],3,null)],1,null),e("div",null,{class:v(c=>`tab-content ${c.value==="contracts"?"active":""}`,[t],'`tab-content ${p0.value==="contracts"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Contratos Inteligentes",3,null),3,null),e("div",null,{class:v(c=>`tab-content ${c.value==="security"?"active":""}`,[t],'`tab-content ${p0.value==="security"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Seguridad y Auditoría",3,null),3,null),e("div",null,{class:v(c=>`tab-content ${c.value==="implementation"?"active":""}`,[t],'`tab-content ${p0.value==="implementation"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Implementación y Despliegue",3,null),3,null),e("div",null,{class:"flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700"},[e("a",null,{href:"/about",class:"inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"},[e("svg",null,{class:"w-4 h-4 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M15 19l-7-7 7-7"},null,3,null),3,null),"Volver a la Información General"],3,null),e("a",null,{href:"/marketplace",class:"inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"},["Explorar Marketplace",e("svg",null,{class:"w-4 h-4 ml-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 5l7 7-7 7"},null,3,null),3,null)],3,null)],3,null)],1,null)],1,null)],1,"Hi_16")},qn=L(h(Vn,"s_IVLxFPyAapY")),Yn=Object.freeze(Object.defineProperty({__proto__:null,_auto_BuildingIcon:xt,_auto_CodeIcon:fe,_auto_CreditCardIcon:ft,_auto_DatabaseIcon:bt,_auto_LockIcon:yt,default:qn},Symbol.toStringTag,{value:"Module"})),Qn=10,vt=(t,l=Qn)=>{if(t.length<=l)return[...t];const a=t.filter(r=>r.role==="system"),s=t.filter(r=>r.role!=="system").slice(-l);return[...a,...s]},Kn=B(async function(t,l=50){if(!t)return console.warn("Server: Cannot load chat history, user not logged in."),[];console.log("Server: Loading text chat history for user:",t);try{const s=(await z(this).execute({sql:"SELECT role, content, created_at as timestamp FROM text_chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?",args:[t,l*2]})).rows.map(r=>{let i="";if(r.content)if(typeof r.content=="string")i=r.content;else if(typeof r.content=="object")try{i=JSON.stringify(r.content)}catch{i=String(r.content)}else i=String(r.content);return{role:String(r.role||"assistant"),content:i,timestamp:r.timestamp?String(r.timestamp):void 0}});return console.log(`Server: Loaded ${s.length} text chat history messages`),s}catch(a){return console.error("Server: Error loading text chat history:",a.message),[]}},"woDlHVQ0ETc");N(h(Kn,"s_woDlHVQ0ETc"));const Wn=B(async function(t,l,a=[]){console.log("Server: Fetching LangChain response for text chat");const o=ke(this);if(!o)return console.error("User not authenticated"),{success:!1,error:"Authentication required"};const s=this.env.get("OPENAI_API_KEY")||{}.OPENAI_API_KEY;if(!s)return console.error("OpenAI API Key not configured on server."),{success:!1,error:"AI service not configured."};try{const r=z(this),i=new Ae({openAIApiKey:s,model:"gpt-4o-mini",temperature:.7}),c="You are Alice, a helpful and friendly AI assistant. You provide clear, concise, and accurate information. Format your responses using Markdown where appropriate: use **double asterisks** around important information, concepts, or key terms to highlight them in bold.",g=a.some(y=>y.role==="system");let p=[...a];if(!g){p.unshift({role:"system",content:c});try{await r.execute({sql:"INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)",args:[o,"system",c]})}catch(y){console.error("Failed to save system message to database:",y)}}p.push({role:"user",content:t});try{await r.execute({sql:"INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)",args:[o,"user",t]})}catch(y){console.error("Failed to save user message to database:",y)}const m=vt(p).map(y=>y.role==="system"?new G(y.content):y.role==="user"?new xe(y.content):new Ie(y.content));console.log(`Server: Using ${m.length} messages for context`);const f=await i.invoke(m);console.log("Raw LLM response:",f),console.log("Response content type:",typeof f.content);let x;if(typeof f.content=="string")x=f.content;else if(f.content===null||f.content===void 0)x="I don't have a response at this time.";else if(Array.isArray(f.content))x=f.content.map(y=>{if(typeof y=="string")return y;if(y==null)return"";if(typeof y=="object")try{return"text"in y?y.text:JSON.stringify(y)}catch{return String(y)}return String(y)}).filter(Boolean).join(" ");else if(typeof f.content=="object")try{"text"in f.content?x=f.content.text:"message"in f.content?x=f.content.message:x=JSON.stringify(f.content)}catch{x=String(f.content)}else x=String(f.content);console.log("Server: Processed response:",x);try{await r.execute({sql:"INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)",args:[o,"assistant",x]})}catch(y){console.error("Failed to save assistant message to database:",y)}return{success:!0,message:x}}catch(r){return console.error("Server: Error in LangChain model:",r),{success:!1,error:r.message||"I'm sorry, I encountered an error processing your request."}}},"1RGIEfdY3jo"),kt=N(h(Wn,"s_1RGIEfdY3jo")),Xn=async t=>{try{const l=ke(t);if(!l)throw t.redirect(302,"/auth/");return{userId:l,initialThreadId:crypto.randomUUID()}}catch(l){throw console.error("Error loading initial data:",l),t.redirect(302,"/auth/")}},wt=de(h(Xn,"s_HSyC1Ew3LSE")),Gn=async()=>{const[t,l,a,o]=k();if(!a.value.trim()||l.value)return;const s=a.value.trim();a.value="",t.push({role:"user",content:s}),l.value=!0;try{const r=await kt(s,o.value,[...t]);r.success&&r.message?t.push({role:"assistant",content:typeof r.message=="string"?r.message:String(r.message)}):t.push({role:"assistant",content:`Sorry, there was an error: ${r.error||"Unknown error"}`})}catch(r){console.error("Error in handleSendMessage:",r),t.push({role:"assistant",content:"Sorry, there was an error processing your request."})}finally{l.value=!1}},Zn=async t=>{const[l]=k();t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),await l())},Jn=()=>{var p;ve(h(St,"s_qY7D762UuFU"));const t=wt(),l=Se([]),a=b(!1),o=b(!1),s=b(""),r=b(((p=t.value)==null?void 0:p.initialThreadId)??crypto.randomUUID()),i=b();F(_("s_0szVzSLaUok",[l,a,t])),F(_("s_MzXpJofAHEk",[l,i]));const c=h(Gn,"s_TwoXyOvjmfw",[l,o,s,r]),g=h(Zn,"s_uBLfm7MTEz8",[c]);return e("div",null,{class:"chat-container"},[e("div",null,{class:"chat-header"},[e("h1",null,{class:"chat-title"},"Text Chat with Alice",3,null),e("p",null,{class:"chat-subtitle"},"Ask me anything and I'll respond with text",3,null)],3,null),e("div",{ref:i},{class:"chat-messages"},[!a.value&&e("div",null,{class:"loading-chat"},[e("div",null,{class:"typing-indicator"},[e("span",null,null,null,3,null),e("span",null,null,null,3,null),e("span",null,null,null,3,null)],3,null),e("p",null,null,"Loading conversation...",3,null)],3,"IV_0"),a.value&&l.length===0&&e("div",null,{class:"empty-chat"},e("p",null,null,"No messages yet. Start a conversation!",3,null),3,"IV_1"),l.map((u,m)=>{if(u.role==="system")return null;console.log(`Message ${m}: role=${u.role}, content type=${typeof u.content}`);let f="";try{typeof u.content=="string"?f=u.content:u.content===null||u.content===void 0?f="":f=JSON.stringify(u.content)}catch(x){console.error(`Error processing message content for message ${m}:`,x),f="Error displaying message"}return e("div",{class:`message ${u.role}`},null,e("div",null,{class:"message-content"},u.role==="assistant"?e("div",{dangerouslySetInnerHTML:{__html:_t(f)}},{class:"assistant-text"},null,3,"IV_2"):e("p",null,null,f,1,null),1,null),1,m)}),o.value&&e("div",null,{class:"message assistant"},e("div",null,{class:"message-content loading"},e("div",null,{class:"typing-indicator"},[e("span",null,null,null,3,null),e("span",null,null,null,3,null),e("span",null,null,null,3,null)],3,null),3,null),3,"IV_3")],1,null),e("div",null,{class:"chat-input-container"},[e("textarea",null,{value:v(u=>u.value,[s],"p0.value"),placeholder:"Type your message here...",disabled:v((u,m)=>m.value||!u.value,[a,o],"p1.value||!p0.value"),class:"chat-input",rows:1,onKeyDown$:g,onChange$:_("s_WAgbsyVUOAM",[s]),onInput$:_("s_juPDkQAJNpA")},null,3,null),e("button",null,{disabled:v((u,m,f)=>m.value||!f.value.trim()||!u.value,[a,o,s],"p1.value||!p2.value.trim()||!p0.value"),class:"send-button",onClick$:c},d(We,null,3,"IV_4"),1,null)],1,null)],1,"IV_5")},ea=L(h(Jn,"s_88n0A9V4ytc"));function _t(t){if(!t)return"";try{let l=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");return l=l.replace(/\n/g,"<br>"),l}catch(l){return console.error("Error rendering markdown:",l),t||""}}const St=`
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 90%;
    width: 900px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1rem;
  }
  
  .chat-header {
    padding: 1rem;
    background-color: #f7f7f9;
    border-bottom: 1px solid #eee;
    border-radius: 12px 12px 0 0;
    margin-bottom: 0.5rem;
  }
  
  .chat-title {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }
  
  .chat-subtitle {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    color: #666;
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .loading-chat, .empty-chat {
    text-align: center;
    color: #999;
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .message {
    max-width: 80%;
    animation: fade-in 0.3s ease-out;
  }
  
  .message.user {
    align-self: flex-end;
  }
  
  .message.assistant {
    align-self: flex-start;
  }
  
  .message-content {
    padding: 0.75rem 1rem;
    border-radius: 1.5rem;
    line-height: 1.4;
    font-size: 0.95rem;
  }
  
  .user .message-content {
    background-color: #1a85ff;
    color: white;
    border-bottom-right-radius: 0.3rem;
  }
  
  .assistant .message-content {
    background-color: #f1f1f4;
    color: #333;
    border-bottom-left-radius: 0.3rem;
  }
  
  .assistant-text {
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .assistant-text strong {
    font-weight: 700;
  }
  
  .chat-input-container {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #fff;
    border-top: 1px solid #eee;
  }
  
  .chat-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 1.5rem;
    border: 1px solid #ddd;
    font-size: 0.95rem;
    resize: none;
    max-height: 150px;
    min-height: 24px;
    line-height: 1.4;
  }
  
  .chat-input:focus {
    outline: none;
    border-color: #1a85ff;
    box-shadow: 0 0 0 2px rgba(26, 133, 255, 0.2);
  }
  
  .send-button {
    background-color: #1a85ff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 1px;
  }
  
  .send-button:hover {
    background-color: #0066cc;
  }
  
  .send-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .typing-indicator {
    display: flex;
    gap: 3px;
    padding: 0 5px;
  }
  
  .typing-indicator span {
    width: 8px;
    height: 8px;
    background-color: #aaa;
    border-radius: 50%;
    display: inline-block;
    opacity: 0.7;
  }
  
  @keyframes typing-bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-5px); }
  }
  
  .typing-indicator span:nth-child(1) { animation: typing-bounce 1.4s ease-in-out infinite; }
  .typing-indicator span:nth-child(2) { animation: typing-bounce 1.4s ease-in-out 0.2s infinite; }
  .typing-indicator span:nth-child(3) { animation: typing-bounce 1.4s ease-in-out 0.4s infinite; }
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .chat-container {
      max-width: 100%;
      height: 100vh;
      border-radius: 0;
      padding: 0;
    }
    
    .message {
      max-width: 85%;
    }
  }
`,ta=Object.freeze(Object.defineProperty({__proto__:null,STYLES:St,_auto_renderPlainMarkdown:_t,_auto_serverFetchLangChainResponse:kt,_auto_trimChatHistory:vt,default:ea,useInitialData:wt},Symbol.toStringTag,{value:"Module"})),la=[],He=()=>zt,q=()=>ml,na=[["/",[q,()=>yl],"/",["q-3c27b2a5.js","q-4a0dd054.js"]],["api/chat-text/",[q,()=>kl],"/api/chat-text/",["q-3c27b2a5.js"]],["auth/logout/",[q,He,()=>Tl],"/auth/logout/",["q-3c27b2a5.js","q-ff56500b.js","q-b1748cfb.js"]],["about/",[q,()=>Ll],"/about/",["q-3c27b2a5.js","q-874064b7.js"]],["auth/",[q,He,()=>Yl],"/auth/",["q-3c27b2a5.js","q-ff56500b.js","q-ed83aca1.js"]],["chat/",[q,()=>Mn],"/chat/",["q-3c27b2a5.js","q-ebf5b4b4.js"]],["courses/",[q,()=>Pn],"/courses/",["q-3c27b2a5.js","q-856dd59f.js"]],["docs/",[q,()=>Yn],"/docs/",["q-3c27b2a5.js","q-a264b344.js"]],["text-chat/",[q,()=>ta],"/text-chat/",["q-3c27b2a5.js","q-506c8eb5.js"]]],aa=[],ra=!0,sa="/",oa=!0,va={routes:na,serverPlugins:la,menus:aa,trailingSlash:ra,basePathname:sa,cacheModules:oa};export{sa as basePathname,oa as cacheModules,va as default,aa as menus,na as routes,la as serverPlugins,ra as trailingSlash};
