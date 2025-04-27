import{r as H,c as N,i as g,b as e,d as c,S as xe,u as E,e as U,f as k,g as C,h as ge,j as n,k as O,l as Ht,L as I,m as G,n as d,F as B,o as A,p as Y,q as V,z as pe,s as il,t as de,w as W,x as K,y as Me,A as qt,B as cl}from"./q-85256de6.js";import{createClient as Vt}from"@libsql/client";import{z as R}from"zod";import{ChatOpenAI as ul}from"@langchain/openai";import{SystemMessage as dl,HumanMessage as gl,AIMessage as pl}from"@langchain/core/messages";import Yt from"country-flag-icons/string/3x2/US";import Xt from"country-flag-icons/string/3x2/ES";import Gt from"country-flag-icons/string/3x2/IT";import Wt from"country-flag-icons/string/3x2/FR";import Kt from"country-flag-icons/string/3x2/BR";function P(l){var t,a;try{console.log("[TURSO] Creating database client");const r=(t=l.env.get("PRIVATE_TURSO_DATABASE_URL"))==null?void 0:t.trim();if(!r)throw console.error("[TURSO] Missing database URL"),new Error("PRIVATE_TURSO_DATABASE_URL is not defined");const o=(a=l.env.get("PRIVATE_TURSO_AUTH_TOKEN"))==null?void 0:a.trim();if(!o){if(!r.includes("file:"))throw console.error("[TURSO] Missing auth token for remote database"),new Error("PRIVATE_TURSO_AUTH_TOKEN is not defined");console.log("[TURSO] No auth token needed for local database")}return console.log(`[TURSO] Creating client for URL: ${r.substring(0,20)}...`),Vt({url:r,authToken:o})}catch(r){throw console.error("[TURSO] Error creating database client:",r),r}}async function Z(l,t,a){console.log(`[TURSO-QUERY] Executing SQL: ${typeof t=="string"?t.substring(0,50):"complex query"}`);const r=P(l);try{let o;return a&&a.length>0?(console.log(`[TURSO-QUERY] With parameters: ${JSON.stringify(a)}`),o=await r.execute({sql:t,args:a})):o=await r.execute(t),console.log(`[TURSO-QUERY] Query successful, returned ${o.rows.length} rows`),o}catch(o){throw console.error("[TURSO-QUERY] Error executing query:",typeof t=="string"?t.substring(0,100):"complex query",a,o),new Error(`Database query failed: ${o instanceof Error?o.message:String(o)}`)}}function ml(l){return new TextEncoder().encode(l)}function Fe(l){return Array.from(new Uint8Array(l)).map(t=>t.toString(16).padStart(2,"0")).join("")}async function bl(l){console.log("[AUTH] Hashing password");const t=ml(l),a=crypto.getRandomValues(new Uint8Array(16)),r=await crypto.subtle.importKey("raw",t,{name:"PBKDF2"},!1,["deriveBits"]),o=await crypto.subtle.deriveBits({name:"PBKDF2",salt:a,iterations:1e5,hash:"SHA-256"},r,256),s=new Uint8Array(a.length+32);s.set(a),s.set(new Uint8Array(o),a.length);const i=Fe(s);return console.log("[AUTH] Password hashed successfully"),i}async function hl(l,t){console.log("[AUTH] Verifying password");const a=new Uint8Array(t.match(/.{1,2}/g).map(b=>parseInt(b,16))),r=a.slice(0,16),o=a.slice(16),s=ml(l),i=await crypto.subtle.importKey("raw",s,{name:"PBKDF2"},!1,["deriveBits"]),u=await crypto.subtle.deriveBits({name:"PBKDF2",salt:r,iterations:1e5,hash:"SHA-256"},i,256),p=Fe(u)===Fe(o);return console.log(`[AUTH] Password verification result: ${p}`),p}const Ge=(l,t,a)=>{const r=String(t),o=86400;l.cookie.set("auth_token",r,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:o}),l.cookie.set("user_type",a,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:o}),l.cookie.set("session_active","true",{path:"/",httpOnly:!1,sameSite:"lax",secure:!0,maxAge:o})},We=l=>{l.cookie.delete("auth_token",{path:"/"}),l.cookie.delete("user_type",{path:"/"}),l.cookie.delete("session_active",{path:"/"})},X=l=>{var a;const t=(a=l.cookie.get("auth_token"))==null?void 0:a.value;return console.log(`[AUTH] Retrieved user_id: ${t||"none"}`),t||null},ve=l=>{var a;const t=(a=l.cookie.get("user_type"))==null?void 0:a.value;return t==="trabajador"||t==="despacho"||t==="sindicato"?t:"trabajador"},fl=l=>ve(l)==="sindicato",Ke=async l=>{try{const t=X(l);if(!t)return!1;const r=await P(l).execute({sql:"SELECT sector FROM contract_details WHERE user_id = ? AND sector = ?",args:[t,"sindicato"]});return console.log(`[AUTH] Checking sindicado status for user ${t}: ${r.rows.length>0}`),r.rows.length>0}catch(t){return console.error("[AUTH] Error checking sindicado status:",t),!1}},Qe=async l=>{try{const t=X(l);if(!t)return!1;const r=await P(l).execute({sql:"SELECT sector FROM contract_details WHERE user_id = ? AND sector = ?",args:[t,"despacho"]});return console.log(`[AUTH] Checking despacho status for user ${t}: ${r.rows.length>0}`),r.rows.length>0}catch(t){return console.error("[AUTH] Error checking despacho status:",t),!1}},ae=async l=>{if(fl(l))return!0;const t=await Ke(l),a=await Qe(l);return t||a},me=async l=>{var o,s;console.log("[AUTH] Verifying authentication");const t=(o=l.cookie.get("auth_token"))==null?void 0:o.value;if(console.log(`[AUTH] Found auth_token: ${t?"yes":"no"}`),!t)return console.log("[AUTH] No auth_token found - user not authenticated"),!1;const a=(s=l.cookie.get("user_type"))==null?void 0:s.value;a||console.log("[AUTH] No user_type found, using default trabajador");const r=86400;l.cookie.set("auth_token",t,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:r}),l.cookie.set("user_type",a||"trabajador",{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:r}),l.cookie.set("session_active","true",{path:"/",httpOnly:!1,sameSite:"lax",secure:!0,maxAge:r});try{await P(l).execute({sql:"UPDATE users SET session_expires = ? WHERE id = ?",args:[new Date(Date.now()+r*1e3),t]})}catch(i){console.error("[AUTH] Error refreshing session in database:",i)}return console.log("[AUTH] User authenticated successfully and session refreshed"),!0},Qt=Object.freeze(Object.defineProperty({__proto__:null,canManageCapacitacion:ae,clearAuthCookies:We,getUserId:X,getUserType:ve,hashPassword:bl,isAdmin:fl,isDespacho:Qe,isSindicado:Ke,setCookies:Ge,verifyAuth:me,verifyPassword:hl},Symbol.toStringTag,{value:"Module"})),Zt=async l=>{const t=ve(l);if(t!=="normal")throw console.log("[Absences] Access denied - redirecting to home. User type:",t),l.redirect(302,"/")},Jt=async l=>({userType:ve(l)}),xl=H(g(Jt,"s_nMzIH0uDSUQ")),en=()=>(xl(),e("div",null,{class:"space-y-6"},[e("header",null,null,[e("h1",null,{class:"text-2xl font-bold text-gray-800 dark:text-white mb-2"},"Registro de Ausencias",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Registra tus días de baja laboral, vacaciones y otras ausencias.",3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 shadow rounded-lg p-6"},c(xe,null,3,"0E_0"),1,null)],1,"0E_1")),ln=N(g(en,"s_NC5FCI3szbA")),tn=Object.freeze(Object.defineProperty({__proto__:null,default:ln,onRequest:Zt,useAbsencesUserInfo:xl},Symbol.toStringTag,{value:"Module"})),nn=async l=>{const t=await me(l);if(t&&!l.pathname.includes("/auth/logout"))throw l.redirect(302,"/");return{isAuthenticated:t}},an=H(g(nn,"s_xckjbOj1HPc")),rn=()=>{const l=E(!1);return U(k("s_xhcLYhTye5s",[l])),e("div",{class:`min-h-screen font-sans ${l.value?"dark bg-gradient-to-br from-teal-900 via-green-900 to-gray-900 text-gray-100":"bg-gradient-to-br from-teal-50 via-green-50 to-gray-50 text-gray-900"}`},{style:{paddingTop:"calc(env(safe-area-inset-top))"}},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden opacity-40 z-0"},[" ",e("div",null,{class:"w-20 h-20 bg-teal-500/10 dark:bg-teal-400/10 rounded-full absolute top-[15%] left-[55%] animate-[float_15s_infinite]"},null,3,null),e("div",null,{class:"w-32 h-32 bg-green-500/10 dark:bg-green-400/10 rounded-full absolute top-[40%] left-[75%] animate-[float_18s_infinite]",style:"animation-delay: 0.5s;"},null,3,null),e("div",null,{class:"w-16 h-16 bg-teal-600/10 dark:bg-teal-500/10 rounded-full absolute top-[70%] left-[65%] animate-[float_12s_infinite]",style:"animation-delay: 1s;"},null,3,null),e("div",null,{class:"w-24 h-24 bg-green-600/10 dark:bg-green-500/10 rounded-full absolute top-[30%] left-[40%] animate-[float_20s_infinite]",style:"animation-delay: 1.5s;"},null,3,null)],3,null),e("div",null,{class:"relative z-10 pt-safe"},c(xe,null,3,"9u_0"),1,null),e("style",null,null,`
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -15px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 15px); }
          100% { transform: translate(0, 0); }
        }
      `,3,null)],1,"9u_1")},on=N(g(rn,"s_nNgqqIoeIss")),sn=Object.freeze(Object.defineProperty({__proto__:null,default:on,useAuthCheck:an},Symbol.toStringTag,{value:"Module"})),cn=async l=>{const t=await me(l);if(!t)throw l.redirect(302,"/auth");const a=await ae(l);if(!a)throw l.redirect(302,"/");return{isAuthenticated:t,canAccess:a}},un=H(g(cn,"s_kCasEOK2wms")),dn=()=>e("div",null,{class:"capacitacion-layout"},e("div",null,{class:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"},c(xe,null,3,"X1_0"),1,null),1,"X1_1"),gn=N(g(dn,"s_ILP9JjLoqDc")),pn=Object.freeze(Object.defineProperty({__proto__:null,default:gn,useAuthCheck:un},Symbol.toStringTag,{value:"Module"})),vl=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"8",y2:"12"},null,3,null),e("line",null,{x1:"12",x2:"12.01",y1:"16",y2:"16"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ui_0"),$e=l=>C("svg",{...l,children:[e("path",null,{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"},null,3,null),e("path",null,{d:"M12 9v4"},null,3,null),e("path",null,{d:"M12 17h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"zY_0"),se=l=>C("svg",{...l,children:[e("path",null,{d:"m12 19-7-7 7-7"},null,3,null),e("path",null,{d:"M19 12H5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"VY_0"),yl=l=>C("svg",{...l,children:[e("path",null,{d:"M5 12h14"},null,3,null),e("path",null,{d:"m12 5 7 7-7 7"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ye_0"),De=l=>C("svg",{...l,children:[e("path",null,{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"},null,3,null),e("path",null,{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"uO_0"),mn=l=>C("svg",{...l,children:[e("path",null,{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"},null,3,null),e("path",null,{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"oi_0"),bn=l=>C("svg",{...l,children:[e("rect",null,{height:"18",rx:"2",ry:"2",width:"18",x:"3",y:"4"},null,3,null),e("line",null,{x1:"16",x2:"16",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"8",x2:"8",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"3",x2:"21",y1:"10",y2:"10"},null,3,null),e("path",null,{d:"m9 16 2 2 4-4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"3s_0"),Se=l=>C("svg",{...l,children:[e("rect",null,{height:"18",rx:"2",ry:"2",width:"18",x:"3",y:"4"},null,3,null),e("line",null,{x1:"16",x2:"16",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"8",x2:"8",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"3",x2:"21",y1:"10",y2:"10"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"34_0"),hn=l=>C("svg",{...l,children:[e("path",null,{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"},null,3,null),e("polyline",null,{points:"22 4 12 14.01 9 11.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Jy_0"),fn=l=>C("svg",{...l,children:e("polyline",null,{points:"20 6 9 17 4 12"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"R2_0"),xn=l=>C("svg",{...l,children:e("path",null,{d:"m6 9 6 6 6-6"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"8g_0"),vn=l=>C("svg",{...l,children:e("path",null,{d:"m18 15-6-6-6 6"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Kp_0"),wl=l=>C("svg",{...l,children:[e("rect",null,{height:"4",rx:"1",ry:"1",width:"8",x:"8",y:"2"},null,3,null),e("path",null,{d:"M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"},null,3,null),e("path",null,{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5"},null,3,null),e("path",null,{d:"M4 13.5V6a2 2 0 0 1 2-2h2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sl_0"),yn=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("polyline",null,{points:"12 6 12 12 16.5 12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"wI_0"),Be=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("polyline",null,{points:"12 6 12 12 16 14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"PM_0"),wn=l=>C("svg",{...l,children:[e("rect",null,{height:"14",rx:"2",ry:"2",width:"14",x:"8",y:"8"},null,3,null),e("path",null,{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"PY_0"),Oe=l=>C("svg",{...l,children:[e("path",null,{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"},null,3,null),e("polyline",null,{points:"7 10 12 15 17 10"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"15",y2:"3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"f4_0"),kn=l=>C("svg",{...l,children:[e("path",null,{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"jA_0"),_n=l=>C("svg",{...l,children:[e("path",null,{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"},null,3,null),e("polyline",null,{points:"14 2 14 8 20 8"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"18",y2:"12"},null,3,null),e("line",null,{x1:"9",x2:"15",y1:"15",y2:"15"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sV_0"),kl=l=>C("svg",{...l,children:[e("path",null,{d:"M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"},null,3,null),e("path",null,{d:"M8 18h1"},null,3,null),e("path",null,{d:"M18.42 9.61a2.1 2.1 0 1 1 2.97 2.97L16.95 17 13 18l.99-3.95 4.43-4.44Z"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"h7_0"),ee=l=>C("svg",{...l,children:[e("path",null,{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"},null,3,null),e("polyline",null,{points:"14 2 14 8 20 8"},null,3,null),e("line",null,{x1:"16",x2:"8",y1:"13",y2:"13"},null,3,null),e("line",null,{x1:"16",x2:"8",y1:"17",y2:"17"},null,3,null),e("line",null,{x1:"10",x2:"8",y1:"9",y2:"9"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"gd_0"),Ae=l=>C("svg",{...l,children:[e("path",null,{d:"M22 10v6M2 10l10-5 10 5-10 5z"},null,3,null),e("path",null,{d:"M6 12v5c3 3 9 3 12 0v-5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Df_0"),En=l=>C("svg",{...l,children:e("path",null,{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"z9_0"),He=l=>C("svg",{...l,children:[e("path",null,{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},null,3,null),e("polyline",null,{points:"9 22 9 12 15 12 15 22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"pt_0"),Tn=l=>C("svg",{...l,children:[e("path",null,{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"},null,3,null),e("path",null,{d:"M9 18h6"},null,3,null),e("path",null,{d:"M10 22h4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"JJ_0"),he=l=>C("svg",{...l,children:[e("line",null,{x1:"12",x2:"12",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"18",y2:"22"},null,3,null),e("line",null,{x1:"4.93",x2:"7.76",y1:"4.93",y2:"7.76"},null,3,null),e("line",null,{x1:"16.24",x2:"19.07",y1:"16.24",y2:"19.07"},null,3,null),e("line",null,{x1:"2",x2:"6",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"18",x2:"22",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"4.93",x2:"7.76",y1:"19.07",y2:"16.24"},null,3,null),e("line",null,{x1:"16.24",x2:"19.07",y1:"7.76",y2:"4.93"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"kT_0"),nl=l=>C("svg",{...l,children:[e("rect",null,{height:"11",rx:"2",ry:"2",width:"18",x:"3",y:"11"},null,3,null),e("path",null,{d:"M7 11V7a5 5 0 0 1 10 0v4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"WS_0"),al=l=>C("svg",{...l,children:[e("path",null,{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"},null,3,null),e("polyline",null,{points:"10 17 15 12 10 7"},null,3,null),e("line",null,{x1:"15",x2:"3",y1:"12",y2:"12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"ca_0"),qe=l=>C("svg",{...l,children:[e("path",null,{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"},null,3,null),e("polyline",null,{points:"16 17 21 12 16 7"},null,3,null),e("line",null,{x1:"21",x2:"9",y1:"12",y2:"12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"0h_0"),Sn=l=>C("svg",{...l,children:[e("rect",null,{height:"16",rx:"2",width:"20",x:"2",y:"4"},null,3,null),e("path",null,{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"n4_0"),ze=l=>C("svg",{...l,children:[e("path",null,{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"},null,3,null),e("circle",null,{cx:"12",cy:"10",r:"3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"8M_0"),Cn=l=>C("svg",{...l,children:[e("line",null,{x1:"4",x2:"20",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"4",x2:"20",y1:"6",y2:"6"},null,3,null),e("line",null,{x1:"4",x2:"20",y1:"18",y2:"18"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"f1_0"),fe=l=>C("svg",{...l,children:e("path",null,{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"42_0"),An=l=>C("svg",{...l,children:[e("line",null,{x1:"2",x2:"22",y1:"2",y2:"22"},null,3,null),e("path",null,{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"},null,3,null),e("path",null,{d:"M5 10v2a7 7 0 0 0 12 5"},null,3,null),e("path",null,{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33"},null,3,null),e("path",null,{d:"M9 9v3a3 3 0 0 0 5.12 2.12"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"19",y2:"22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Vn_0"),In=l=>C("svg",{...l,children:[e("path",null,{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"},null,3,null),e("path",null,{d:"M19 10v2a7 7 0 0 1-14 0v-2"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"19",y2:"22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"xC_0"),Rn=l=>C("svg",{...l,children:e("path",null,{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Oe_0"),Dn=l=>C("svg",{...l,children:[e("path",null,{d:"m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"},null,3,null),e("path",null,{d:"m13 13 6 6"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"uR_0"),Ln=l=>C("svg",{...l,children:[e("path",null,{d:"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"},null,3,null),e("path",null,{d:"m15 5 4 4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"eG_0"),Ve=l=>C("svg",{...l,children:e("polygon",null,{points:"5 3 19 12 5 21 5 3"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ic_0"),Ze=l=>C("svg",{...l,children:[e("path",null,{d:"M5 12h14"},null,3,null),e("path",null,{d:"M12 5v14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Z7_0"),Nn=l=>C("svg",{...l,children:[e("polyline",null,{points:"6 9 6 2 18 2 18 9"},null,3,null),e("path",null,{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"},null,3,null),e("rect",null,{height:"8",width:"12",x:"6",y:"14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ad_0"),Mn=l=>C("svg",{...l,children:[e("path",null,{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"},null,3,null),e("path",null,{d:"M3 3v5h5"},null,3,null),e("path",null,{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"},null,3,null),e("path",null,{d:"M16 16h5v5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"CE_0"),je=l=>C("svg",{...l,children:[e("path",null,{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"},null,3,null),e("polyline",null,{points:"17 21 17 13 7 13 7 21"},null,3,null),e("polyline",null,{points:"7 3 7 8 15 8"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Jw_0"),On=l=>C("svg",{...l,children:[e("circle",null,{cx:"11",cy:"11",r:"8"},null,3,null),e("path",null,{d:"m21 21-4.3-4.3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"OE_0"),_l=l=>C("svg",{...l,children:[e("path",null,{d:"m22 2-7 20-4-9-9-4Z"},null,3,null),e("path",null,{d:"M22 2 11 13"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ll_0"),El=l=>C("svg",{...l,children:[e("path",null,{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"},null,3,null),e("path",null,{d:"M5 3v4"},null,3,null),e("path",null,{d:"M19 17v4"},null,3,null),e("path",null,{d:"M3 5h4"},null,3,null),e("path",null,{d:"M17 19h4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"61_0"),rl=l=>C("svg",{...l,children:e("rect",null,{height:"18",rx:"2",width:"18",x:"3",y:"3"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Sb_0"),jn=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"4"},null,3,null),e("path",null,{d:"M12 2v2"},null,3,null),e("path",null,{d:"M12 20v2"},null,3,null),e("path",null,{d:"m4.93 4.93 1.41 1.41"},null,3,null),e("path",null,{d:"m17.66 17.66 1.41 1.41"},null,3,null),e("path",null,{d:"M2 12h2"},null,3,null),e("path",null,{d:"M20 12h2"},null,3,null),e("path",null,{d:"m6.34 17.66-1.41 1.41"},null,3,null),e("path",null,{d:"m19.07 4.93-1.41 1.41"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Qm_0"),Tl=l=>C("svg",{...l,children:[e("path",null,{d:"M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"},null,3,null),e("path",null,{d:"M7 7h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"N3_0"),Pn=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"6"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"t5_0"),Un=l=>C("svg",{...l,children:[e("path",null,{d:"M3 6h18"},null,3,null),e("path",null,{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"},null,3,null),e("path",null,{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"},null,3,null),e("line",null,{x1:"10",x2:"10",y1:"11",y2:"17"},null,3,null),e("line",null,{x1:"14",x2:"14",y1:"11",y2:"17"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Eb_0"),$n=l=>C("svg",{...l,children:[e("path",null,{d:"M3 6h18"},null,3,null),e("path",null,{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"},null,3,null),e("path",null,{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"St_0"),Le=l=>C("svg",{...l,children:[e("path",null,{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"12",cy:"7",r:"4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sX_0"),Ye=l=>C("svg",{...l,children:[e("path",null,{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"9",cy:"7",r:"4"},null,3,null),e("path",null,{d:"M22 21v-2a4 4 0 0 0-3-3.87"},null,3,null),e("path",null,{d:"M16 3.13a4 4 0 0 1 0 7.75"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"pI_0"),zn=l=>C("svg",{...l,children:[e("path",null,{d:"m22 8-6 4 6 4V8Z"},null,3,null),e("rect",null,{height:"12",rx:"2",ry:"2",width:"14",x:"2",y:"6"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"2v_0"),Fn=l=>C("svg",{...l,children:[e("polygon",null,{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"},null,3,null),e("path",null,{d:"M15.54 8.46a5 5 0 0 1 0 7.07"},null,3,null),e("path",null,{d:"M19.07 4.93a10 10 0 0 1 0 14.14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"0H_0"),Bn=l=>C("svg",{...l,children:[e("polygon",null,{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"},null,3,null),e("line",null,{x1:"22",x2:"16",y1:"9",y2:"15"},null,3,null),e("line",null,{x1:"16",x2:"22",y1:"9",y2:"15"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"gs_0"),Hn=l=>C("svg",{...l,children:[e("path",null,{d:"M18 6 6 18"},null,3,null),e("path",null,{d:"m6 6 12 12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"CN_0"),qn=async l=>{var o;if(console.log("[DOCUMENTOS-LEGALES] Verificando autenticación y permisos"),!await me(l))throw console.log("[DOCUMENTOS-LEGALES] Usuario no autenticado, redirigiendo a login"),l.redirect(302,"/auth");const a=await Qe(l),r=await Ke(l);if(!a&&!r)throw console.log("[DOCUMENTOS-LEGALES] Usuario no autorizado para esta sección, redirigiendo a inicio"),l.redirect(302,"/");return{isAuthenticated:!0,isDespacho:a,isSindicado:r,userId:((o=l.cookie.get("auth_token"))==null?void 0:o.value)||null}},Pe=H(g(qn,"s_9qdGODRuQEA")),Vn=()=>{const t=ge().url.pathname,a=[{href:"/documentos-legales/",label:"Inicio",icon:He,active:t==="/documentos-legales/"},{href:"/documentos-legales/asistente/",label:"Asistente IA",icon:fe,active:t.includes("/documentos-legales/asistente/")},{href:"/documentos-legales/mis-documentos/",label:"Mis Documentos",icon:ee,active:t.includes("/documentos-legales/mis-documentos/")}];return e("div",null,{class:"documentos-legal-layout"},[e("header",null,{class:"layout-header"},e("div",null,{class:"header-content"},[e("h1",null,{class:"site-title"},"Sistema Legal",3,null),e("nav",null,{class:"site-nav"},e("ul",null,{class:"nav-list"},a.map(r=>e("li",{class:`nav-item ${r.active?"active":""}`},null,c(I,{get href(){return r.href},class:"nav-link",children:[c(r.icon,{class:"nav-icon",[n]:{class:n}},3,"as_0"),e("span",null,null,O(r,"label"),1,null)],[n]:{href:Ht(r,"href"),class:n}},1,"as_1"),1,r.href)),1,null),1,null)],1,null),1,null),e("main",null,{class:"layout-main"},c(xe,null,3,"as_2"),1,null),e("style",null,null,`
        .documentos-legal-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f9fafb;
        }
        
        .layout-header {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .site-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }
        
        .site-nav {
          margin-left: auto;
        }
        
        .nav-list {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 1rem;
        }
        
        .nav-item {
          position: relative;
        }
        
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -0.75rem;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #e53e3e;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: color 0.2s;
        }
        
        .nav-item.active .nav-link {
          color: #e53e3e;
        }
        
        .nav-link:hover {
          color: #111827;
        }
        
        .nav-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .layout-main {
          flex: 1;
          padding: 1rem;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .site-nav {
            width: 100%;
            margin-left: 0;
          }
          
          .nav-list {
            justify-content: space-between;
          }
        }
        `,3,null)],1,"as_3")},Yn=N(g(Vn,"s_J1X6RZ303Kw")),Xn=Object.freeze(Object.defineProperty({__proto__:null,default:Yn,useAuthCheck:Pe},Symbol.toStringTag,{value:"Module"})),Gn=async l=>{var i,u;const t=await me(l),a=t?ve(l):null;let r=!1,o=!1,s=!1;if(t){const{isSindicado:p,isDespacho:b}=await Promise.resolve().then(()=>Qt);o=await p(l),s=await b(l),r=!o&&!s,console.log("[LAYOUT] User roles detected:",{isTrabajador:r,isSindicado:o,isDespacho:s})}return{isAuthenticated:t,userType:a,userId:((i=l.cookie.get("userId"))==null?void 0:i.value)||null,username:((u=l.cookie.get("username"))==null?void 0:u.value)||null,isTrabajador:r,isSindicado:o,isDespacho:s}},Sl=H(g(Gn,"s_HC3ct71u5lY")),Wn=()=>{const[l]=A();l.value?(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light")):(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark")),l.value=!l.value},Kn=()=>{const[l]=A();l.value=!0},Qn=()=>{const[l]=A();return l.value=!1},Zn=()=>{const[l]=A();return l.value=!1},Jn=()=>{const[l]=A();return l.value=!1},ea=()=>{const[l]=A();return l.value=!1},la=()=>{const[l]=A();return l.value=!1},ta=()=>{const[l]=A();return l.value=!1},na=()=>{const[l]=A();return l.value=!1},aa=()=>{const[l]=A();return l.value=!1},ra=()=>{const[l]=A();return l.value=!1},oa=()=>{const[l,t]=A();t.value=!1,l.value=!0},sa=()=>{const[l]=A();return l.value=!1},ia=()=>{var u,p,b,m,x,y,_,S,T,v,h,w,M,j,f,Q,te,$,re,ne;G();const l=Sl(),t=ge(),a=E(!1),r=E(!1),o=E(!1);U(k("s_c6Pb49uSSiw",[l,o])),U(k("s_70w0lA9O1OU",[r]));const s=g(Wn,"s_0whHyN0kxrI",[r]),i=D=>!!(D==="/"&&t.url.pathname==="/"||D!=="/"&&t.url.pathname.startsWith(D));return e("div",null,{class:"min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"},[e("nav",null,{class:"bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"},[e("div",null,{class:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"},e("div",null,{class:"flex justify-between h-16"},[e("div",null,{class:"flex"},[e("div",null,{class:"flex-shrink-0 flex items-center"},c(I,{href:"/","aria-label":"Home",children:c(Ae,{class:"w-9 h-9 text-red-600 dark:text-red-500",[n]:{class:n}},3,"as_0"),[n]:{href:n,"aria-label":n}},1,"as_1"),1,null),e("div",null,{class:"hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3"},[c(I,{href:"/",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(He,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_2"),e("span",null,null,"Inicio",3,null)],1,null),[n]:{href:n}},1,"as_3"),c(I,{href:"/docs",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/docs")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(De,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_4"),e("span",null,null,"Documentos",3,null)],1,null),[n]:{href:n}},1,"as_5"),c(I,{href:"/about",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/about")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(Ye,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_6"),e("span",null,null,"Acerca de",3,null)],1,null),[n]:{href:n}},1,"as_7"),((u=l.value)==null?void 0:u.isAuthenticated)&&(((p=l.value)==null?void 0:p.isSindicado)||((b=l.value)==null?void 0:b.isDespacho))&&c(I,{href:"/chat",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/chat")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(fe,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_8"),e("span",null,null,"Chat",3,null)],1,null),[n]:{href:n}},1,"as_9"),((m=l.value)==null?void 0:m.isTrabajador)&&c(I,{href:"/absences",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/absences")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(Se,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_10"),e("span",null,null,"Ausencias",3,null)],1,null),[n]:{href:n}},1,"as_11"),((x=l.value)==null?void 0:x.isTrabajador)&&c(I,{href:"/timesheet",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/timesheet")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(Be,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_12"),e("span",null,null,"Fichaje",3,null)],1,null),[n]:{href:n}},1,"as_13"),(((y=l.value)==null?void 0:y.isSindicado)||((_=l.value)==null?void 0:_.isDespacho))&&c(I,{href:"/capacitacion",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/capacitacion")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(Ae,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_14"),e("span",null,null,"Capacitación",3,null)],1,null),[n]:{href:n}},1,"as_15"),(((S=l.value)==null?void 0:S.isSindicado)||((T=l.value)==null?void 0:T.isDespacho))&&c(I,{href:"/documentos-legales",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${i("/documentos-legales")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(ee,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_16"),e("span",null,null,"Documentos Legales",3,null)],1,null),[n]:{href:n}},1,"as_17")],1,null)],1,null),e("div",null,{class:"flex items-center gap-1"},[e("button",null,{class:"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 p-2 rounded-md","aria-label":d(D=>D.value?"Switch to Light Mode":"Switch to Dark Mode",[r],'p0.value?"Switch to Light Mode":"Switch to Dark Mode"'),onClick$:s},r.value?c(jn,{class:"w-5 h-5",[n]:{class:n}},3,"as_18"):c(Rn,{class:"w-5 h-5",[n]:{class:n}},3,"as_19"),1,null),(v=l.value)!=null&&v.isAuthenticated?e("div",null,{class:"flex items-center space-x-2"},[l.value&&e("div",null,{class:"hidden sm:flex"},e("span",{class:`px-2 py-1 text-xs rounded-full font-medium ${l.value.isTrabajador?"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300":l.value.isDespacho?"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300":l.value.isSindicado?"bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300":"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`},null,d(D=>D.value.isTrabajador?"Trabajador":D.value.isDespacho?"Despacho":D.value.isSindicado?"Sindicato":"Usuario",[l],'p0.value.isTrabajador?"Trabajador":p0.value.isDespacho?"Despacho":p0.value.isSindicado?"Sindicato":"Usuario"'),3,null),1,"as_20"),c(I,{href:"/profile",class:`hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center transition-colors ${i("/profile")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[c(Le,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_21"),e("span",null,null,d(D=>D.value.username||"Perfil",[l],'p0.value.username||"Perfil"'),3,null)],1,null),[n]:{href:n}},1,"as_22"),c(I,{href:"/auth/logout",class:"hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",onClick$:g(Kn,"s_RKVaC5VuZ1U",[o]),children:e("div",null,{class:"flex items-center"},o.value?c(B,{children:e("div",null,{class:"flex items-center justify-center"},[e("div",null,{class:"w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse"},null,3,null),e("span",null,null,"Cerrando sesión...",3,null)],3,null)},3,"as_23"):c(B,{children:[c(qe,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_24"),e("span",null,null,"Cerrar sesión",3,null)]},1,"as_25"),1,null),[n]:{href:n,class:n,onClick$:n}},1,"as_26")],1,"as_27"):c(I,{href:"/auth",class:"hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",children:e("div",null,{class:"flex items-center"},[c(al,{class:"w-5 h-5 mr-1.5",[n]:{class:n}},3,"as_28"),e("span",null,null,"Iniciar sesión",3,null)],1,null),[n]:{href:n,class:n}},1,"as_29"),e("button",null,{class:"sm:hidden p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 rounded-md","aria-expanded":d(D=>D.value,[a],"p0.value"),"aria-controls":"mobile-menu","aria-label":"Main menu",onClick$:k("s_Ff2XDudc5YY",[a])},a.value?c(Hn,{class:"w-6 h-6",[n]:{class:n}},3,"as_30"):c(Cn,{class:"w-6 h-6",[n]:{class:n}},3,"as_31"),1,null)],1,null)],1,null),1,null),e("div",null,{class:d(D=>`sm:hidden ${D.value?"block":"hidden"}`,[a],'`sm:hidden ${p0.value?"block":"hidden"}`'),id:"mobile-menu"},e("div",null,{class:"px-2 pt-2 pb-3 space-y-1"},[c(I,{href:"/",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(Qn,"s_gRl1GCjZWxE",[a]),children:e("div",null,{class:"flex items-center"},[c(He,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_32"),e("span",null,null,"Inicio",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_33"),c(I,{href:"/docs",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/docs")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(Zn,"s_lVCfvAzL4AA",[a]),children:e("div",null,{class:"flex items-center"},[c(De,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_34"),e("span",null,null,"Documentos",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_35"),c(I,{href:"/about",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/about")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(Jn,"s_0eWNaKEnmzE",[a]),children:e("div",null,{class:"flex items-center"},[c(Ye,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_36"),e("span",null,null,"Acerca de",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_37"),((h=l.value)==null?void 0:h.isAuthenticated)&&(((w=l.value)==null?void 0:w.isSindicado)||((M=l.value)==null?void 0:M.isDespacho))&&c(I,{href:"/chat",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/chat")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(ea,"s_KTgeAMec2Fc",[a]),children:e("div",null,{class:"flex items-center"},[c(fe,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_38"),e("span",null,null,"Chat",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_39"),((j=l.value)==null?void 0:j.isTrabajador)&&c(I,{href:"/absences",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/absences")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(la,"s_ivtnlsVV2bI",[a]),children:e("div",null,{class:"flex items-center"},[c(Se,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_40"),e("span",null,null,"Ausencias",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_41"),((f=l.value)==null?void 0:f.isTrabajador)&&c(I,{href:"/timesheet",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/timesheet")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(ta,"s_yAu2s7f1HcU",[a]),children:e("div",null,{class:"flex items-center"},[c(Be,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_42"),e("span",null,null,"Fichaje",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_43"),(((Q=l.value)==null?void 0:Q.isSindicado)||((te=l.value)==null?void 0:te.isDespacho))&&c(I,{href:"/capacitacion",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/capacitacion")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(na,"s_8HfEBSnUrik",[a]),children:e("div",null,{class:"flex items-center"},[c(Ae,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_44"),e("span",null,null,"Capacitación",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_45"),((($=l.value)==null?void 0:$.isSindicado)||((re=l.value)==null?void 0:re.isDespacho))&&c(I,{href:"/documentos-legales",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/documentos-legales")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(aa,"s_vHYpojP31Us",[a]),children:e("div",null,{class:"flex items-center"},[c(ee,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_46"),e("span",null,null,"Documentos Legales",3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_47"),(ne=l.value)!=null&&ne.isAuthenticated?c(B,{children:[e("div",null,{class:"mb-2 px-3 py-2"},e("span",{class:`px-2 py-1 text-xs rounded-full font-medium ${l.value.isTrabajador?"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300":l.value.isDespacho?"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300":l.value.isSindicado?"bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300":"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`},null,d(D=>D.value.isTrabajador?"Trabajador":D.value.isDespacho?"Despacho":D.value.isSindicado?"Sindicato":"Usuario",[l],'p0.value.isTrabajador?"Trabajador":p0.value.isDespacho?"Despacho":p0.value.isSindicado?"Sindicato":"Usuario"'),3,null),1,null),c(I,{href:"/profile",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${i("/profile")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:g(ra,"s_QTgPe42PmQc",[a]),children:e("div",null,{class:"flex items-center"},[c(Le,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_48"),e("span",null,null,d(D=>D.value.username||"Perfil",[l],'p0.value.username||"Perfil"'),3,null)],1,null),[n]:{href:n,onClick$:n}},1,"as_49"),c(I,{href:"/auth/logout",class:"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",onClick$:g(oa,"s_nExMI7qOC0E",[o,a]),children:e("div",null,{class:"flex items-center"},o.value?c(B,{children:e("div",null,{class:"flex items-center justify-center"},[e("div",null,{class:"w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse"},null,3,null),e("span",null,null,"Cerrando sesión...",3,null)],3,null)},3,"as_50"):c(B,{children:[c(qe,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_51"),e("span",null,null,"Cerrar sesión",3,null)]},1,"as_52"),1,null),[n]:{href:n,class:n,onClick$:n}},1,"as_53")]},1,"as_54"):c(I,{href:"/auth",class:"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",onClick$:g(sa,"s_044tpdQmN0U",[a]),children:e("div",null,{class:"flex items-center"},[c(al,{class:"w-5 h-5 mr-3",[n]:{class:n}},3,"as_55"),e("span",null,null,"Iniciar sesión",3,null)],1,null),[n]:{href:n,class:n,onClick$:n}},1,"as_56")],1,null),1,null)],1,null),e("main",null,{class:"container mx-auto py-4 px-4 md:px-6"},e("div",null,{style:{viewTransitionName:"main-content"}},c(xe,null,3,"as_57"),1,null),1,null),e("footer",null,{class:"mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"},e("div",null,{class:"container mx-auto px-4 md:px-6"},e("div",null,{class:"text-center text-gray-600 dark:text-gray-400 text-sm"},["© ",new Date().getFullYear()," DAI-OFF. Todos los derechos reservados."],1,null),1,null),1,null)],1,"as_58")},ca=N(g(ia,"s_08vswLB0CwY")),ua=Object.freeze(Object.defineProperty({__proto__:null,default:ca,useAuthCheck:Sl},Symbol.toStringTag,{value:"Module"})),da=async l=>{if(!await me(l))throw l.redirect(302,"/auth");const a=ve(l);if(a!=="normal")throw console.log(`[Timesheet] Access denied: User type ${a} is not allowed.`),l.redirect(302,"/");return{userType:a,userId:X(l)||null}},Cl=H(g(da,"s_E1zhf4rsXCA")),ga=()=>(Cl(),ge(),e("div",null,{class:"container mx-auto py-6 px-4"},[e("header",null,{class:"mb-8"},[e("h1",null,{class:"text-3xl font-bold text-gray-800 dark:text-white mb-2"},"Control de Fichaje",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Registra tu entrada y salida diaria y controla tus horas de trabajo.",3,null)],3,null),e("main",null,null,c(xe,null,3,"es_0"),1,null)],1,"es_1")),pa=N(g(ga,"s_0AF8q4dVdvA")),ma=Object.freeze(Object.defineProperty({__proto__:null,default:pa,useAuthCheck:Cl},Symbol.toStringTag,{value:"Module"})),ba=()=>e("div",null,{class:"flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900"},[e("section",null,{class:"relative py-16 lg:py-20 px-4 sm:px-6 overflow-hidden hero-section",style:{viewTransitionName:"hero-section"}},[e("div",null,{class:"absolute inset-0 pointer-events-none overflow-hidden"},e("div",null,{class:"absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-100/60 to-red-50/30 dark:from-red-900/30 dark:to-red-900/10"},null,3,null),3,null),e("div",null,{class:"max-w-7xl mx-auto relative px-2 sm:px-4"},e("div",null,{class:"flex flex-col sm:flex-row items-center gap-6 w-full"},[e("div",null,{class:"w-full sm:w-auto max-w-xs mx-auto sm:mx-0 order-2 sm:order-1"},e("div",null,{class:"rounded-lg overflow-hidden shadow-lg border-2 border-red-200 dark:border-red-800 aspect-[3/4] sm:aspect-auto bg-gray-100 dark:bg-gray-800",style:{viewTransitionName:"avatar-video"}},e("video",null,{autoplay:!0,loop:!0,muted:!0,playsInline:!0,class:"w-full h-full object-cover object-center",style:{maxHeight:"280px"}},[e("source",null,{src:"/prs_daioff.idle.mp4",type:"video/mp4"},null,3,null),"Your browser does not support the video tag."],3,null),3,null),3,null),e("div",null,{class:"w-full sm:flex-1 text-center order-1 sm:order-2"},[e("h1",null,{class:"text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight"},[e("span",null,{class:"block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300",style:{viewTransitionName:"hero-title"}},"DAI Off",3,null),e("span",null,{class:"block mt-1"},"Tu Defensor Laboral Digital",3,null)],3,null),e("p",null,{class:"mt-3 mt-4 mb-4 sm:mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed mx-auto max-w-lg"},"En Dai Off entendemos los retos del entorno laboral moderno. Nuestra plataforma brinda asesoramiento legal laboral personalizado y en tiempo real, proporcionando a los trabajadores la información necesaria para tomar decisiones estratégicas.",3,null),e("div",null,{class:"mt-5 sm:mt-8 flex flex-wrap gap-3 justify-center"},[c(I,{href:"/about",class:"px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center text-sm sm:text-base",children:["Quienes Somos",c(yl,{class:"ml-2 h-4 w-4 sm:h-5 sm:w-5",[n]:{class:n}},3,"k9_0")],[n]:{href:n,class:n}},1,"k9_1"),c(I,{href:"/chat",class:"px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm hover:shadow-md text-sm sm:text-base",children:"Chat con DAI Off",[n]:{href:n,class:n}},3,"k9_2")],1,null)],1,null)],1,null),1,null)],1,null),e("section",null,{class:"py-12 px-4 sm:px-6 lg:py-16",style:{viewTransitionName:"features-section"}},e("div",null,{class:"max-w-7xl mx-auto"},[e("div",null,{class:"text-center mb-12"},[e("h2",null,{class:"text-3xl font-bold text-gray-900 dark:text-white"},"Descubre Herramientas que Empoderan",3,null),e("p",null,{class:"mt-4 text-xl text-gray-600 dark:text-gray-300"},"Protege tus derechos laborales con nuestra tecnología avanzada",3,null)],3,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item",style:{viewTransitionName:"feature-1"}},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4"},c(De,{class:"w-6 h-6 text-red-600 dark:text-red-400",[n]:{class:n}},3,"k9_3"),1,null),e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-2"},"Asesoría Rápida",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Obtén respuestas inmediatas a tus consultas laborales con nuestra plataforma de IA.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item",style:{viewTransitionName:"feature-2"}},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4"},c(fe,{class:"w-6 h-6 text-red-600 dark:text-red-400",[n]:{class:n}},3,"k9_4"),1,null),e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-2"},"Asesoría Personalizada",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Soluciones adaptadas a tus necesidades específicas y situación laboral única.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item",style:{viewTransitionName:"feature-3"}},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4"},c(El,{class:"w-6 h-6 text-red-600 dark:text-red-400",[n]:{class:n}},3,"k9_5"),1,null),e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-2"},"Asesoría Legal",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Consulta sin límites sobre normativa laboral, estatutos y convenios colectivos.",3,null)],1,null)],1,null)],1,null),1,null),e("section",null,{class:"py-12 px-4 sm:px-6 lg:py-16 bg-gray-100 dark:bg-gray-950",style:{viewTransitionName:"why-section"}},e("div",null,{class:"max-w-7xl mx-auto"},[e("div",null,{class:"text-center mb-12"},e("h2",null,{class:"text-3xl font-bold text-gray-900 dark:text-white"},"¿Por qué deberías elegirnos?",3,null),3,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-3 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item",style:{viewTransitionName:"reason-1"}},[e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-4"},"Experiencia Confirmada",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Contamos con inteligencia artificial especializada en legislación laboral, estatuto de trabajadores, ley de seguridad social, ley tributaria y convenios colectivos por sector.",3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item",style:{viewTransitionName:"reason-2"}},[e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-4"},"Compromiso con la Claridad",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Garantizamos transparencia total en cada paso del proceso para asegurar que recibas orientación sin ninguna sorpresa.",3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item",style:{viewTransitionName:"reason-3"}},[e("h3",null,{class:"text-xl font-semibold text-gray-900 dark:text-white mb-4"},"Asesoría Personalizada",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Nuestras respuestas se adaptan a las necesidades específicas de tu empresa, tomando en cuenta las regulaciones locales y sectoriales.",3,null)],3,null)],3,null)],3,null),3,null),e("section",null,{class:"py-12 px-4 sm:px-6 lg:py-16 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-800 dark:to-red-900",style:{viewTransitionName:"cta-section"}},e("div",null,{class:"max-w-4xl mx-auto text-center"},[e("h2",null,{class:"text-3xl font-bold text-white"},"¿Listo para proteger tus derechos laborales?",3,null),e("p",null,{class:"mt-4 text-xl text-red-100 dark:text-red-200"},"Regístrate hoy y da el primer paso hacia una asesoría laboral personalizada.",3,null),e("div",null,{class:"mt-8"},c(I,{href:"/auth",class:"px-8 py-3 rounded-lg bg-white text-red-600 font-medium transition-colors shadow-lg hover:bg-red-50",children:"Registrarse Ahora",[n]:{href:n,class:n}},3,"k9_6"),1,null)],1,null),1,null),e("footer",null,{class:"py-8 px-4 sm:px-6 bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"},e("div",null,{class:"max-w-7xl mx-auto text-center text-gray-500 dark:text-gray-400"},["© ",new Date().getFullYear()," Reclamaciones Tech Ai Solution SL. Todos los derechos reservados. |",c(I,{href:"/terms",class:"hover:text-red-600 dark:hover:text-red-400 ml-2",children:"Términos",[n]:{href:n,class:n}},3,"k9_7")," |",c(I,{href:"/privacy",class:"hover:text-red-600 dark:hover:text-red-400 ml-2",children:"Privacidad",[n]:{href:n,class:n}},3,"k9_8")],1,null),1,null)],1,"k9_9"),ha=N(g(ba,"s_0H7JnAEW1p0")),fa={title:"DAI Off - Tu Defensor Laboral Digital",meta:[{name:"description",content:"DAI Off brinda asesoramiento legal laboral personalizado y en tiempo real, proporcionando a los trabajadores la información necesaria para tomar decisiones estratégicas."}]},xa=Object.freeze(Object.defineProperty({__proto__:null,default:ha,head:fa},Symbol.toStringTag,{value:"Module"})),va=({cookie:l,redirect:t})=>{throw l.delete("auth_token",{path:"/"}),l.delete("user_type",{path:"/"}),t(302,"/auth")},ya=async(l,t)=>{try{console.log("[LOGOUT] Starting logout process"),We(t);const a=t.cookie.get("auth_token"),r=t.cookie.get("user_type");if(a||r)throw console.error("[LOGOUT] Cookies not cleared properly:",{authToken:a,userType:r}),new Error("Failed to clear authentication cookies");return console.log("[LOGOUT] Successfully cleared all cookies"),t.redirect(302,"/auth"),{success:!0}}catch(a){return console.error("Logout error:",a),{success:!1,error:a instanceof Error?a.message:"Logout failed"}}},Al=Y(g(ya,"s_X10g1MGFVho")),wa=()=>{},ka=()=>{var a,r;G();const l=Al(),t=((a=l.value)==null?void 0:a.success)===!1;return e("div",null,{class:"min-h-screen w-full flex items-center justify-center transition-colors duration-300 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-blue-950 py-6 px-4 sm:px-6 lg:px-8 overflow-hidden relative"},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden"},[e("div",null,{class:"w-20 h-20 bg-blue-500/10 rounded-full absolute top-[10%] left-[15%] animate-[float_15s_infinite]"},null,3,null),e("div",null,{class:"w-32 h-32 bg-indigo-500/10 rounded-full absolute top-[30%] left-[65%] animate-[float_18s_infinite]",style:"animation-delay: 0.5s;"},null,3,null),e("div",null,{class:"w-16 h-16 bg-teal-500/10 rounded-full absolute top-[70%] left-[25%] animate-[float_12s_infinite]",style:"animation-delay: 1s;"},null,3,null)],3,null),e("div",null,{class:"absolute top-6 left-1/2 transform -translate-x-1/2"},e("div",null,{class:"flex items-center"},[e("div",null,{class:"relative"},e("div",null,{class:"w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"w-6 h-6"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round",d:"m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"},null,3,null),3,null),3,null),3,null),e("h1",null,{class:"ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"DAI Off",3,null)],3,null),3,null),e("div",null,{class:"max-w-md w-full z-10"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]"},[e("div",null,{class:"text-center mb-8"},[e("h2",null,{class:"text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"Log Out",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-400"},"Are you sure you want to log out?",3,null)],3,null),c(V,{action:l,class:"space-y-6",spaReset:!0,get"preventdefault:submit"(){return l.isRunning},onSubmitCompleted$:g(wa,"s_GZ039Xhc9W0"),children:[e("button",null,{type:"submit",disabled:d(o=>o.isRunning,[l],"p0.isRunning"),class:"w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-500 dark:to-red-400 dark:hover:from-red-600 dark:hover:to-red-500 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:k("s_CCfP4YxazY4")},l.isRunning?e("span",null,{class:"flex items-center"},[c(he,{class:"animate-spin mr-2 h-5 w-5",[n]:{class:n}},3,"S9_0"),"Logging out..."],1,"S9_1"):e("span",null,{class:"flex items-center"},[c(qe,{class:"mr-2 h-5 w-5",[n]:{class:n}},3,"S9_2"),"Confirm Logout"],1,null),1,null),t&&e("div",null,{class:"p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm mt-4"},[e("p",null,null,"There was a problem logging you out. Please try again.",3,null),((r=l.value)==null?void 0:r.error)&&e("p",null,{class:"mt-1 text-xs opacity-80"},d(o=>o.value.error,[l],"p0.value.error"),3,"S9_3")],1,"S9_4"),e("a",null,{href:"/",class:"block w-full text-center mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"},"Cancel",3,null)],[n]:{action:n,class:n,spaReset:n,"preventdefault:submit":d(o=>o.isRunning,[l],"p0.isRunning"),onSubmitCompleted$:n}},1,"S9_5")],1,null),e("div",null,{class:"mt-6 text-center text-sm text-gray-600 dark:text-gray-400"},"Thank you for using DAI Off",3,null)],1,null),e("style",null,null,`
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
      `,3,null)],1,"S9_6")},_a=N(g(ka,"s_JBiTm0tuWIY")),Ea=Object.freeze(Object.defineProperty({__proto__:null,default:_a,onGet:va,useLogout:Al},Symbol.toStringTag,{value:"Module"})),Ta=async(l,t)=>{const a=X(t);if(!a)return{success:!1,message:"Debe iniciar sesión para crear un curso"};try{const r=P(t),o=`
        INSERT INTO cursos_capacitacion
        (titulo, descripcion, descripcion_completa, categoria, instructor, duracion, imagen_color, creado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,s=[l.titulo,l.descripcion,l.descripcionCompleta,l.categoria,l.instructor||null,l.duracion||null,l.imagenColor,a],i=await r.execute(o,s);if(i.lastInsertRowid)return{success:!0,cursoId:Number(i.lastInsertRowid),message:"Curso creado exitosamente"};throw new Error("No se pudo obtener el ID del curso creado")}catch(r){return console.error("[CAPACITACION] Error al crear curso:",r),{success:!1,message:`Error al crear el curso: ${r instanceof Error?r.message:String(r)}`}}},Sa={titulo:R.string().min(5,"El título debe tener al menos 5 caracteres"),descripcion:R.string().min(10,"La descripción debe tener al menos 10 caracteres"),descripcionCompleta:R.string().min(20,"La descripción completa debe ser más detallada"),categoria:R.enum(["seguridad","derechos","prevencion","igualdad","salud"]),instructor:R.string().optional(),duracion:R.string().optional(),imagenColor:R.string().default("bg-red-100 dark:bg-red-900/20")},Il=Y(g(Ta,"s_0nEMJyukSFA"),pe(g(Sa,"s_Q8umz0qrVWY"))),Ca=()=>{const[l]=A();l.value=!0},Aa=()=>{var i,u,p,b,m,x,y,_,S,T;G();const l=Il(),t=il(),a=de({titulo:"",descripcion:"",descripcionCompleta:"",categoria:"seguridad",instructor:"",duracion:"",imagenColor:"bg-red-100 dark:bg-red-900/20"}),r=[{id:"bg-red-100 dark:bg-red-900/20",nombre:"Rojo"},{id:"bg-blue-100 dark:bg-blue-900/20",nombre:"Azul"},{id:"bg-green-100 dark:bg-green-900/20",nombre:"Verde"},{id:"bg-yellow-100 dark:bg-yellow-900/20",nombre:"Amarillo"},{id:"bg-purple-100 dark:bg-purple-900/20",nombre:"Morado"},{id:"bg-indigo-100 dark:bg-indigo-900/20",nombre:"Índigo"},{id:"bg-pink-100 dark:bg-pink-900/20",nombre:"Rosa"}],o=[{id:"seguridad",nombre:"Seguridad y Salud en el Trabajo"},{id:"derechos",nombre:"Derechos Laborales Básicos"},{id:"prevencion",nombre:"Prevención del Acoso Laboral"},{id:"igualdad",nombre:"Igualdad Salarial y No Discriminación"},{id:"salud",nombre:"Gestión del Estrés y Salud Mental"}],s=E(!1);return U(k("s_VvAbaCTjcnI",[l,s,t])),e("div",null,{class:"crear-curso-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},e("a",null,{href:"/capacitacion",class:"text-blue-600 hover:text-blue-800 flex items-center"},[c(se,{class:"w-5 h-5 mr-1",[n]:{class:n}},3,"eb_0"),"Volver a capacitaciones"],1,null),1,null),e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Crear nuevo curso de capacitación",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-6"},"Completa el formulario para crear un nuevo curso que estará disponible para todos los usuarios",3,null)],1,null),((i=l.value)==null?void 0:i.success)&&e("div",null,{class:"bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-6"},[e("p",null,null,d(v=>v.value.message,[l],"p0.value.message"),3,null),e("p",null,{class:"text-sm mt-1"},"Redirigiendo al curso creado...",3,null)],3,"eb_1"),((u=l.value)==null?void 0:u.success)===!1&&e("div",null,{class:"bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6"},e("p",null,null,d(v=>v.value.message,[l],"p0.value.message"),3,null),3,"eb_2"),c(V,{action:l,class:"bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700",onSubmit$:g(Ca,"s_55jqUpKy4SE",[s]),children:e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"titulo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Título del curso *",3,null),e("input",null,{id:"titulo",name:"titulo",type:"text",required:!0,value:d(v=>v.titulo,[a],"p0.titulo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. Seguridad y Salud en el Trabajo",onInput$:k("s_FlRWYe0WS0s",[a])},null,3,null),((b=(p=l.value)==null?void 0:p.fieldErrors)==null?void 0:b.titulo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(v=>v.value.fieldErrors.titulo,[l],"p0.value.fieldErrors.titulo"),3,"eb_3")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción breve *",3,null),e("input",null,{id:"descripcion",name:"descripcion",type:"text",required:!0,value:d(v=>v.descripcion,[a],"p0.descripcion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Breve descripción que aparecerá en la lista de cursos",onInput$:k("s_2hMJ0HOe7zg",[a])},null,3,null),((x=(m=l.value)==null?void 0:m.fieldErrors)==null?void 0:x.descripcion)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(v=>v.value.fieldErrors.descripcion,[l],"p0.value.fieldErrors.descripcion"),3,"eb_4")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcionCompleta",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción completa *",3,null),e("textarea",null,{id:"descripcionCompleta",name:"descripcionCompleta",required:!0,value:d(v=>v.descripcionCompleta,[a],"p0.descripcionCompleta"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-32",placeholder:"Descripción detallada del curso, objetivos, a quién va dirigido, etc.",onInput$:k("s_0hB1avsrOWE",[a])},null,3,null),((_=(y=l.value)==null?void 0:y.fieldErrors)==null?void 0:_.descripcionCompleta)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(v=>v.value.fieldErrors.descripcionCompleta,[l],"p0.value.fieldErrors.descripcionCompleta"),3,"eb_5")],1,null),e("div",null,null,[e("label",null,{for:"categoria",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Categoría *",3,null),e("select",null,{id:"categoria",name:"categoria",required:!0,value:d(v=>v.categoria,[a],"p0.categoria"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:k("s_fXY8G2y3PyE",[a])},o.map(v=>e("option",{value:O(v,"id")},null,v.nombre,1,v.id)),1,null),((T=(S=l.value)==null?void 0:S.fieldErrors)==null?void 0:T.categoria)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(v=>v.value.fieldErrors.categoria,[l],"p0.value.fieldErrors.categoria"),3,"eb_6")],1,null),e("div",null,null,[e("label",null,{for:"imagenColor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Color de fondo",3,null),e("select",null,{id:"imagenColor",name:"imagenColor",value:d(v=>v.imagenColor,[a],"p0.imagenColor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:k("s_lTUsCSW6GQA",[a])},r.map(v=>e("option",{value:O(v,"id")},null,v.nombre,1,v.id)),1,null)],1,null),e("div",null,null,[e("label",null,{for:"instructor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Instructor (opcional)",3,null),e("input",null,{id:"instructor",name:"instructor",type:"text",value:d(v=>v.instructor,[a],"p0.instructor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Nombre del instructor",onInput$:k("s_cR0dfOCTv0o",[a])},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"duracion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Duración (opcional)",3,null),e("input",null,{id:"duracion",name:"duracion",type:"text",value:d(v=>v.duracion,[a],"p0.duracion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. 2 horas, 3 semanas, etc.",onInput$:k("s_rIThEY0DCy0",[a])},null,3,null)],3,null),e("div",null,{class:"col-span-1 md:col-span-2 flex justify-end"},e("button",null,{type:"submit",disabled:d(v=>v.value,[s],"p0.value"),class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"},s.value?c(B,{children:[e("div",null,{class:"w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"},null,3,null),e("span",null,null,"Guardando...",3,null)]},3,"eb_7"):c(B,{children:[c(je,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"eb_8"),e("span",null,null,"Guardar curso",3,null)]},1,"eb_9"),1,null),1,null)],1,null),[n]:{action:n,class:n,onSubmit$:n}},1,"eb_10")],1,"eb_11")},Ia=N(g(Aa,"s_ZoIAUAP4UR0")),Ra=Object.freeze(Object.defineProperty({__proto__:null,default:Ia,useCrearCursoAction:Il},Symbol.toStringTag,{value:"Module"})),Rl=[{title:"Contrato Indefinido",prompt:"Crea un contrato de trabajo indefinido entre la empresa [nombre de empresa] y el trabajador [nombre del trabajador] para el puesto de [puesto] con salario de [salario] euros mensuales.",documentType:"contrato",categoria:"contratos-laborales"},{title:"Carta de Despido",prompt:"Genera una carta de despido por causas objetivas para [nombre del empleado] que trabaja como [puesto] desde [fecha de inicio], detallando las causas económicas que justifican la decisión.",documentType:"despido",categoria:"despidos"},{title:"Demanda por Despido Improcedente",prompt:"Redacta una demanda por despido improcedente para [nombre] contra la empresa [nombre de empresa], incluyendo los hechos relevantes y la fundamentación jurídica.",documentType:"demanda",categoria:"demandas"},{title:"Reclamación de Cantidades",prompt:"Crea un documento de reclamación de cantidades adeudadas por la empresa [nombre de empresa] al trabajador [nombre del trabajador], detallando los conceptos e importes reclamados.",documentType:"reclamacion",categoria:"reclamaciones"}],Dl=[{title:"Solicitud de Afiliación",prompt:"Crea un formulario de solicitud de afiliación sindical para [nombre del sindicato], incluyendo los campos necesarios y derechos y obligaciones.",documentType:"afiliacion",categoria:"afiliaciones"},{title:"Denuncia de Incumplimiento de Convenio",prompt:"Redacta una denuncia por incumplimiento del convenio colectivo por parte de la empresa [nombre de empresa], especificando los artículos vulnerados y las circunstancias.",documentType:"denuncia",categoria:"convenios"},{title:"Comunicado Sindical",prompt:"Elabora un comunicado sindical para informar a los trabajadores sobre [tema] con un tono profesional pero accesible.",documentType:"comunicado",categoria:"derechos"},{title:"Convocatoria de Asamblea",prompt:"Redacta una convocatoria para una asamblea sindical en [fecha] para tratar los siguientes temas: [temas a tratar].",documentType:"convocatoria",categoria:"conflictos"}],Da=K(async function(l,t,a=[]){console.log("Servidor: Generando documento legal con IA");const r=this.env.get("OPENAI_API_KEY")||{}.OPENAI_API_KEY;if(!r)return console.error("OpenAI API Key no configurada en el servidor."),"Error: Servicio de IA no configurado.";try{const o=new ul({openAIApiKey:r,model:"gpt-4o-mini",temperature:.2}),s=`Eres un asistente especializado en la generación de documentos legales laborales en España. 
    Genera documentos completos, bien estructurados y profesionales. Utiliza lenguaje jurídico apropiado.
    Incluye todas las cláusulas, términos y condiciones relevantes para el tipo de documento solicitado.
    Formatea el texto para que sea fácil de leer, utilizando secciones, párrafos y enumeraciones cuando sea apropiado.
    Asegúrate de que el documento sea legalmente válido según la legislación laboral española vigente.
    Si se solicita un documento específico como ${t}, asegúrate de seguir sus requisitos formales.`,i=a.some(m=>m.role==="system");let u=[...a];i||u.unshift({role:"system",content:s}),u.push({role:"user",content:l});const p=u.map(m=>m.role==="system"?new dl(m.content):m.role==="user"?new gl(m.content):new pl(m.content));console.log(`Servidor: Usando ${p.length} mensajes como contexto`);const b=await o.invoke(p);return console.log("Servidor: Documento generado correctamente"),b.content}catch(o){return console.error("Servidor: Error en el modelo LangChain:",o),"Lo siento, encontré un error al procesar tu solicitud de documento."}},"OCLNTNKObwg"),Ll=W(g(Da,"s_OCLNTNKObwg")),La=K(async function(l,t,a,r){var o,s;if(!l){console.warn("Servidor: No se puede guardar la sesión, usuario no autenticado.");return}console.log("Servidor: Guardando sesión de documento para usuario:",l);try{const i=((o=this.env)==null?void 0:o.get("PRIVATE_TURSO_DATABASE_URL"))||{}.PRIVATE_TURSO_DATABASE_URL,u=((s=this.env)==null?void 0:s.get("PRIVATE_TURSO_AUTH_TOKEN"))||{}.PRIVATE_TURSO_AUTH_TOKEN;if(!i)return console.error("Servidor: URL de base de datos no configurada"),null;const{createClient:p}=await import("@libsql/client"),b=p({url:i,authToken:u||void 0});(await b.execute({sql:"SELECT name FROM sqlite_master WHERE type='table' AND name='document_sessions'"})).rows.length===0&&(await b.execute({sql:`CREATE TABLE document_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          document_type TEXT NOT NULL,
          messages TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`}),console.log("Servidor: Tabla document_sessions creada"));const x=JSON.stringify(r),y=await b.execute({sql:`INSERT INTO document_sessions 
            (user_id, title, document_type, messages, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,args:[l,a,t,x,new Date().toISOString(),new Date().toISOString()]});return console.log("Servidor: Sesión de documento guardada con éxito",y),y.lastInsertRowid}catch(i){return console.error("Servidor: Error al guardar sesión de documento:",i.message),console.error("Servidor: Detalles del error:",i),null}},"EfEgIGKnlS0"),Nl=W(g(La,"s_EfEgIGKnlS0")),Na=async l=>{var a;const t=(a=l.cookie.get("auth_token"))==null?void 0:a.value;if(!t)return[];try{const r=P(l);return(await r.execute({sql:"SELECT name FROM sqlite_master WHERE type='table' AND name='document_sessions'"})).rows.length===0?[]:(await r.execute({sql:`SELECT id, title, document_type, updated_at 
            FROM document_sessions 
            WHERE user_id = ? 
            ORDER BY updated_at DESC 
            LIMIT 10`,args:[t]})).rows}catch(r){return console.error("Error al cargar sesiones de documentos:",r),[]}},Ml=H(g(Na,"s_1pxcu0jQ6Tk")),Ma=async(l,{cookie:t,...a})=>{var m;const{prompt:r,documentType:o,title:s}=l;if(!r)return{success:!1,message:"El prompt no puede estar vacío"};const i=await Ll(r,o||"general",[]),u=[{role:"user",content:r,timestamp:new Date().toISOString()},{role:"assistant",content:i,timestamp:new Date().toISOString()}],p=((m=t.get("auth_token"))==null?void 0:m.value)||"dev_user",b=s||`Documento ${o} - ${new Date().toLocaleDateString()}`;return await Nl(p,o,b,u),{success:!0,document:i,messages:u}},Oa={prompt:R.string().min(1,"El prompt no puede estar vacío"),documentType:R.string().default("general"),title:R.string().optional()},Ol=Y(g(Ma,"s_vC3SeOd5dwY"),pe(g(Oa,"s_Ne2m8FbI00k"))),jl=`
.documento-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #f9fafb;
  padding: 1rem;
}

.prompt-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.prompt-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.template-card {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  background-color: #e5e7eb;
  transform: translateY(-2px);
}

.template-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.prompt-textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  resize: vertical;
  font-family: inherit;
}

.btn-container {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e53e3e;
  color: white;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: #c53030;
}

.document-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.document-tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.tool-btn:hover {
  background-color: #e5e7eb;
}

.document-content {
  white-space: pre-wrap;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-family: 'Times New Roman', Times, serif;
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
  line-height: 1.5;
}

.past-sessions {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.sessions-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.session-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.session-card:hover {
  background-color: #f3f4f6;
}

.session-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-date {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-container {
    flex-direction: column;
  }
  
  .document-tools {
    flex-wrap: wrap;
  }
}
`,ja=K(async function(l,t,a,r,o,s,i=""){var u,p;if(console.log(`BD ASISTENTE: Guardando documento con origen="${s}"`),console.log(`BD ASISTENTE: ID=${t}, título=${a}, categoría=${r}, userId=${l}`),!l)return console.warn("BD ASISTENTE: No se puede guardar el documento, usuario no autenticado."),!1;if(!t||!a)return console.error("BD ASISTENTE: Error en parámetros - ID o título faltantes"),!1;try{const b=((u=this.env)==null?void 0:u.get("PRIVATE_TURSO_DATABASE_URL"))||{}.PRIVATE_TURSO_DATABASE_URL,m=((p=this.env)==null?void 0:p.get("PRIVATE_TURSO_AUTH_TOKEN"))||{}.PRIVATE_TURSO_AUTH_TOKEN;if(!b)return console.error("BD ASISTENTE: URL de base de datos no configurada"),!1;console.log("BD ASISTENTE: Conectando a la base de datos:",b.substring(0,20)+"...");const{createClient:x}=await import("@libsql/client"),y=x({url:b,authToken:m||void 0});console.log("BD ASISTENTE: Verificando si existe la tabla documentos_legales..."),(await y.execute({sql:"SELECT name FROM sqlite_master WHERE type='table' AND name='documentos_legales'"})).rows.length===0?(console.log("BD ASISTENTE: Creando tabla documentos_legales..."),await y.execute({sql:`CREATE TABLE documentos_legales (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          titulo TEXT NOT NULL,
          categoria TEXT NOT NULL,
          fecha TEXT NOT NULL,
          estado TEXT NOT NULL,
          origen TEXT NOT NULL,
          contenido TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`}),console.log("BD ASISTENTE: Tabla documentos_legales creada correctamente")):console.log("BD ASISTENTE: La tabla documentos_legales ya existe"),console.log("BD ASISTENTE: Verificando si existe la columna contenido...");try{await y.execute({sql:"SELECT contenido FROM documentos_legales LIMIT 1"}),console.log("BD ASISTENTE: La columna contenido existe en la tabla")}catch{console.log("BD ASISTENTE: Añadiendo columna contenido a la tabla..."),await y.execute({sql:"ALTER TABLE documentos_legales ADD COLUMN contenido TEXT"}),console.log("BD ASISTENTE: Columna contenido añadida correctamente")}console.log("BD ASISTENTE: Verificando si existe la columna origen...");try{await y.execute({sql:"SELECT origen FROM documentos_legales LIMIT 1"}),console.log("BD ASISTENTE: La columna origen existe en la tabla")}catch{console.log("BD ASISTENTE: Añadiendo columna origen a la tabla..."),await y.execute({sql:"ALTER TABLE documentos_legales ADD COLUMN origen TEXT DEFAULT 'generador'"}),console.log("BD ASISTENTE: Columna origen añadida correctamente")}console.log("BD ASISTENTE: Consultando documentos existentes para este usuario...");const S=await y.execute({sql:"SELECT id, titulo, origen FROM documentos_legales WHERE user_id = ? LIMIT 5",args:[l]});console.log(`BD ASISTENTE: Encontrados ${S.rows.length} documentos para el usuario (muestra de 5 max):`),S.rows.forEach((w,M)=>{console.log(`BD ASISTENTE: Doc ${M+1}: ID=${w.id}, Título=${w.titulo}, Origen=${w.origen||"no definido"}`)}),console.log("BD ASISTENTE: Insertando documento en la BD..."),console.log(`BD ASISTENTE: Longitud del contenido: ${(i==null?void 0:i.length)||0} caracteres`);const T=new Date().toISOString().split("T")[0];s=s==="asistente"?"asistente":"generador",console.log(`BD ASISTENTE: Usando origen final: "${s}"`);const v=await y.execute({sql:`INSERT INTO documentos_legales
            (id, user_id, titulo, categoria, fecha, estado, origen, contenido)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,args:[t,l,a,r,T,o,s,i]});console.log("BD ASISTENTE: Documento guardado con éxito. Resultado:",v),console.log("BD ASISTENTE: Verificando que el documento se guardó correctamente...");const h=await y.execute({sql:"SELECT id, titulo, origen FROM documentos_legales WHERE id = ?",args:[t]});if(h.rows.length>0){const w=h.rows[0];console.log(`BD ASISTENTE: Verificación exitosa: ID=${w.id}, Título=${w.titulo}, Origen=${w.origen}`)}else console.error("BD ASISTENTE: ¡ALERTA! El documento no se encontró después de guardarlo.");return!0}catch(b){return console.error("BD ASISTENTE: Error al guardar documento:",b.message),console.error("BD ASISTENTE: Detalles del error:",b),b.cause&&console.error("BD ASISTENTE: Causa del error:",b.cause),!1}},"q3pKML6T5w8"),Pl=W(g(ja,"s_q3pKML6T5w8")),Pa=l=>{const[t,a,r,o,s]=A();o.value=l,r.value=l.prompt,a.value=l.documentType,t.value||(t.value=`${l.title} - ${new Date().toLocaleDateString()}`),s.value=!1},Ua=async()=>{const[l,t]=A();if(t.messages.length===0){alert("No hay contenido para generar un documento. Por favor, genere el documento primero.");return}const a=t.messages.find(r=>r.role==="assistant");if(!a){alert("No se encontró contenido del asistente en el documento.");return}try{if(!l.value.userId){console.error("Usuario no autenticado:",l.value),alert("Debe iniciar sesión para guardar documentos.");return}const r=Date.now(),o=Math.floor(Math.random()*1e3),s=`asistente-${r}-${o}`,i=a.content||"",u=t.title||`Documento ${t.documentType} - ${new Date().toLocaleDateString()}`;if(console.log(`DEPURACIÓN ASISTENTE: Usuario ID=${l.value.userId}, Tipo=${t.documentType}`),console.log(`DEPURACIÓN ASISTENTE: Generando PDF para documento: ${u} (ID: ${s})`),console.log(`DEPURACIÓN ASISTENTE: Longitud del contenido: ${i.length} caracteres`),!i.trim()){console.error("DEPURACIÓN ASISTENTE: El contenido del documento está vacío"),alert("Error: El documento generado está vacío. Por favor, inténtelo de nuevo.");return}if(console.log('DEPURACIÓN ASISTENTE: Guardando documento en la BD con origen="asistente"'),!await Pl(l.value.userId,s,u,t.documentType||"general","completado","asistente",i)){console.error("DEPURACIÓN ASISTENTE: El servidor devolvió false al guardar el documento"),alert("Error al guardar el documento en la base de datos. Verifique la consola para más detalles.");return}console.log(`DEPURACIÓN ASISTENTE: Documento guardado con éxito. Redirigiendo a: /documentos-legales/pdf/${s}`),window.location.href=`/documentos-legales/pdf/${s}`}catch(r){const o=r instanceof Error?r.message:"Error desconocido",s=r instanceof Error?r.stack:"";console.error("DEPURACIÓN ASISTENTE: Error al generar el PDF:",o),console.error("DEPURACIÓN ASISTENTE: Stack de error:",s),alert(`No se pudo generar el PDF. Error: ${o}

Revise la consola para más información.`)}},$a=async()=>{const[l]=A();if(l.messages.length===0)return;const t=l.messages.find(a=>a.role==="assistant");if(t)try{await navigator.clipboard.writeText(t.content),alert("Documento copiado al portapapeles")}catch(a){console.error("Error al copiar el documento:",a),alert("No se pudo copiar el documento")}},za=()=>{const[l,t,a,r,o,s]=A();r.value="",l.value="",a.value="general",o.value=null,s.value=!0,t.messages=[]},Fa=()=>{var S;G(),Me(g(jl,"s_WNqLUJ6kTbk"));const l=Pe(),t=Ml(),a=Ol(),r=E(null),o=E(""),s=E(""),i=E("general"),u=E(!0),p=de({messages:[],title:"",documentType:""}),b=l.value.isDespacho?Rl:Dl,m=g(Pa,"s_kme81fTu7Uk",[s,i,o,r,u]),x=g(Ua,"s_PhZG1qN8LQs",[l,p]),y=g($a,"s_ATqBkzZIu2c",[p]),_=g(za,"s_0cI4mLClRI4",[s,p,i,o,r,u]);return U(k("s_gysBsCF9K1I",[s,p,i,a])),e("div",null,{class:"documento-page"},[e("div",null,{class:"prompt-section"},[e("h2",null,{class:"prompt-title"},"Generar Documento Legal",3,null),u.value&&c(B,{children:[e("p",null,{class:"mb-4"},"Selecciona una plantilla o escribe tu propia solicitud:",3,null),e("div",null,{class:"templates-grid"},b.map(T=>e("div",{onClick$:k("s_BTaFDe80g7M",[m,T])},{class:"template-card"},[e("div",null,{class:"template-title"},O(T,"title"),1,null),e("p",null,{class:"text-sm text-gray-600 truncate"},[T.prompt.substring(0,60),"..."],1,null)],0,T.title)),1,null)]},1,"q5_0"),c(V,{action:a,children:[e("div",null,{class:"mb-4"},[e("label",null,{class:"block mb-2 text-sm font-medium"},"Título del Documento:",3,null),e("input",null,{type:"text",name:"title",value:d(T=>T.value,[s],"p0.value"),class:"w-full p-2 border border-gray-300 rounded-md",placeholder:"Ingresa un título para tu documento",onChange$:k("s_JvDWeQ4MiNc",[s])},null,3,null)],3,null),e("div",null,{class:"mb-4"},[e("label",null,{class:"block mb-2 text-sm font-medium"},"Instrucción para el Documento:",3,null),e("textarea",null,{name:"prompt",value:d(T=>T.value,[o],"p0.value"),class:"prompt-textarea",placeholder:"Describe el documento legal que necesitas. Puedes incluir detalles específicos como nombres, fechas, importes, etc.",onChange$:k("s_WSLAcLXqxyI",[o])},null,3,null),e("input",null,{type:"hidden",name:"documentType",value:d(T=>T.value,[i],"p0.value")},null,3,null)],3,null),e("div",null,{class:"btn-container"},[!u.value&&e("button",null,{type:"button",class:"tool-btn",onClick$:k("s_GENo1yQgOpY",[u])},"Ver Plantillas",3,"q5_1"),e("button",null,{type:"button",class:"tool-btn",onClick$:_},[c(Mn,{class:"w-4 h-4",[n]:{class:n}},3,"q5_2"),e("span",null,null,"Reiniciar",3,null)],1,null),e("button",null,{type:"submit",class:"primary-btn",disabled:d((T,v)=>T.isRunning||!v.value.trim(),[a,o],"p0.isRunning||!p1.value.trim()")},[c(_l,{class:"w-4 h-4",[n]:{class:n}},3,"q5_3"),e("span",null,null,d(T=>T.isRunning?"Generando...":"Generar Documento",[a],'p0.isRunning?"Generando...":"Generar Documento"'),3,null)],1,null)],1,null)],[n]:{action:n}},1,"q5_4")],1,null),p.messages.length>0&&e("div",null,{class:"document-section"},[e("div",null,{class:"document-tools"},[e("button",null,{class:"tool-btn",onClick$:k("s_k70gFFZLnyI",[p,x])},[c(Oe,{class:"w-4 h-4",[n]:{class:n}},3,"q5_5"),e("span",null,null,"Exportar PDF",3,null)],1,null),e("button",null,{class:"tool-btn",onClick$:y},[c(wn,{class:"w-4 h-4",[n]:{class:n}},3,"q5_6"),e("span",null,null,"Copiar",3,null)],1,null)],1,null),e("div",null,{class:"document-content"},((S=p.messages.find(T=>T.role==="assistant"))==null?void 0:S.content)||"",1,null)],1,"q5_7"),t.value.length>0&&e("div",null,{class:"past-sessions"},[e("h3",null,{class:"sessions-title"},"Documentos Recientes",3,null),e("div",null,{class:"sessions-grid"},t.value.map(T=>e("div",null,{class:"session-card"},[e("div",null,{class:"session-title"},O(T,"title"),1,null),e("div",null,{class:"session-date"},new Date(T.updated_at).toLocaleDateString(),1,null)],1,T.id)),1,null)],1,"q5_8")],1,"q5_9")},Ba=N(g(Fa,"s_s0kIatv8nWk")),Ha=Object.freeze(Object.defineProperty({__proto__:null,_auto_STYLES:jl,_auto_plantillasDespacho:Rl,_auto_plantillasSindicato:Dl,_auto_serverGenerateDocument:Ll,_auto_serverSaveDocumentInDB:Pl,_auto_serverSaveDocumentSession:Nl,default:Ba,useDocumentSessions:Ml,useGenerateDocumentAction:Ol},Symbol.toStringTag,{value:"Module"})),qa=async l=>{try{await Z(l,`CREATE TABLE IF NOT EXISTS documentos_legales (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        titulo TEXT NOT NULL,
        categoria TEXT NOT NULL,
        fecha TEXT NOT NULL,
        estado TEXT NOT NULL,
        origen TEXT NOT NULL,
        contenido TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);const t=X(l);if(!t)return{success:!1,error:"Usuario no autenticado",documentos:[]};try{await Z(l,"SELECT origen FROM documentos_legales LIMIT 1"),console.log("MIS-DOCS: La columna origen existe en la tabla")}catch{console.log("MIS-DOCS: Añadiendo columna origen a la tabla documentos_legales"),await Z(l,"ALTER TABLE documentos_legales ADD COLUMN origen TEXT DEFAULT 'generador'"),console.log("MIS-DOCS: Columna origen añadida correctamente")}console.log(`MIS-DOCS: Consultando documentos para usuario ID=${t}`);const a=await Z(l,"SELECT id, titulo, categoria, fecha, estado, origen FROM documentos_legales WHERE user_id = ? ORDER BY fecha DESC",[t]);console.log(`MIS-DOCS: Se encontraron ${a.rows.length} documentos para el usuario ${t}`);const r=a.rows.filter(o=>o.origen==="asistente");return console.log(`MIS-DOCS: Documentos del asistente: ${r.length}`),a.rows.length>0?(console.log("MIS-DOCS: Todos los documentos encontrados:"),a.rows.forEach((o,s)=>{console.log(`MIS-DOCS: Doc ${s+1}: ID=${o.id}, Título=${o.titulo}, Origen=${o.origen||"no definido"}`)})):console.log("MIS-DOCS: No se encontraron documentos para este usuario"),{success:!0,error:null,documentos:a.rows.map(o=>({id:o.id,titulo:o.titulo,categoria:o.categoria,fecha:o.fecha,estado:o.estado,origen:o.origen}))}}catch(t){return console.error("Error al cargar documentos:",t),{success:!1,error:"Error al cargar los documentos",documentos:[]}}},Ul=H(g(qa,"s_aLH21Z2USTc")),Va=()=>{G(),Pe(),ge();const l=Ul();return new Date().getTime(),e("div",null,{class:"mis-documentos-page"},[e("div",null,{class:"page-header"},[e("h1",null,{class:"page-title"},"Mis Documentos",3,null),e("p",null,{class:"page-description"},"Gestiona todos tus documentos legales generados",3,null)],3,null),e("div",null,{class:"documents-list"},[e("div",null,{class:"list-header"},[e("div",null,{class:"header-nombre"},"Nombre del documento",3,null),e("div",null,{class:"header-categoria"},"Categoría",3,null),e("div",null,{class:"header-fecha"},"Fecha",3,null),e("div",null,{class:"header-acciones"},"Acciones",3,null)],3,null),l.value.success?l.value.documentos.length===0?e("div",null,{class:"empty-state"},[e("p",null,null,"No tienes documentos guardados.",3,null),e("p",null,null,"Puedes crear documentos usando el Asistente IA o seleccionando una plantilla en la sección Inicio.",3,null),e("div",null,{class:"empty-actions"},[c(I,{href:"/documentos-legales/asistente/",class:"create-doc-btn",children:"Usar Asistente IA",[n]:{href:n,class:n}},3,"0Y_2"),c(I,{href:"/documentos-legales/",class:"alternative-btn",children:"Ver plantillas",[n]:{href:n,class:n}},3,"0Y_3")],1,null)],1,"0Y_4"):e("div",null,null,l.value.documentos.map(t=>e("div",null,{class:"document-item"},[e("div",null,{class:"doc-nombre"},[c(ee,{class:"w-5 h-5 doc-icon",[n]:{class:n}},3,"0Y_5"),e("span",null,{class:"doc-titulo"},O(t,"titulo"),1,null)],1,null),e("div",null,{class:"doc-categoria"},O(t,"categoria"),1,null),e("div",null,{class:"doc-fecha"},[c(Se,{class:"w-4 h-4",[n]:{class:n}},3,"0Y_6"),e("span",null,null,new Date(t.fecha).toLocaleDateString(),1,null)],1,null),e("div",null,{class:"doc-acciones"},[c(I,{href:`/documentos-legales/pdf/${t.id}`,class:"action-btn view",children:[c(kn,{class:"w-4 h-4",[n]:{class:n}},3,"0Y_7"),e("span",null,null,"Ver",3,null)],[n]:{class:n}},1,"0Y_8"),c(I,{href:`/documentos-legales/pdf/${t.id}`,target:"_blank",class:"action-btn download",children:[c(Oe,{class:"w-4 h-4",[n]:{class:n}},3,"0Y_9"),e("span",null,null,"Descargar",3,null)],[n]:{target:n,class:n}},1,"0Y_10")],1,null)],1,t.id)),1,null):e("div",null,{class:"error-message"},[c(vl,{class:"w-8 h-8 text-red-500",[n]:{class:n}},3,"0Y_0"),e("p",null,null,d(t=>t.value.error,[l],"p0.value.error"),3,null)],1,"0Y_1")],1,null),e("style",null,null,`
        .mis-documentos-page {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-description {
          color: #6b7280;
          max-width: 600px;
        }
        
        .filters-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .search-box {
          flex-grow: 1;
          max-width: 400px;
        }
        
        .search-input {
          width: 100%;
          padding: 0.625rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .filter-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .filter-btn, .filter-select {
          padding: 0.625rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-btn:hover, .filter-select:hover {
          border-color: #9ca3af;
        }
        
        .documents-list {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .list-header {
          display: grid;
          grid-template-columns: 3fr 1.5fr 1.5fr 1.5fr;
          padding: 1rem 1.5rem;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .document-item {
          display: grid;
          grid-template-columns: 3fr 1.5fr 1.5fr 1.5fr;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        }
        
        .document-item:last-child {
          border-bottom: none;
        }
        
        .document-item:hover {
          background-color: #f9fafb;
        }
        
        .doc-nombre {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .doc-icon {
          color: #3b82f6;
          flex-shrink: 0;
        }
        
        .doc-titulo {
          font-weight: 500;
          color: #111827;
        }
        
        .doc-categoria {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .doc-fecha {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .doc-acciones {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
        }
        
        .action-btn.view {
          background-color: #eff6ff;
          color: #1e40af;
        }
        
        .action-btn.view:hover {
          background-color: #dbeafe;
        }
        
        .action-btn.download {
          background-color: #f0fdf4;
          color: #166534;
        }
        
        .action-btn.download:hover {
          background-color: #dcfce7;
        }
        
        .error-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          color: #dc2626;
          background-color: #fee2e2;
          border-radius: 0.5rem;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          color: #6b7280;
        }
        
        .empty-state p {
          margin-bottom: 1rem;
          max-width: 500px;
        }
        
        .empty-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .create-doc-btn {
          display: inline-block;
          padding: 0.625rem 1.25rem;
          background-color: #e53e3e;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .create-doc-btn:hover {
          background-color: #dc2626;
        }
        
        .alternative-btn {
          display: inline-block;
          padding: 0.625rem 1.25rem;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          font-weight: 500;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .alternative-btn:hover {
          background-color: #e5e7eb;
          border-color: #9ca3af;
        }
        
        @media (max-width: 1024px) {
          .list-header, .document-item {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .list-header {
            display: none;
          }
          
          .document-item {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .doc-categoria, .doc-fecha {
            margin-left: 2.25rem;
          }
          
          .doc-acciones {
            margin-left: 2.25rem;
            justify-content: start;
          }
        }
        `,3,null)],1,"0Y_11")},Ya=N(g(Va,"s_qKIBTpLzI04")),Xa=Object.freeze(Object.defineProperty({__proto__:null,default:Ya,useDocumentosLegales:Ul},Symbol.toStringTag,{value:"Module"})),Ga=async l=>{const t=l.params.id;if(!await ae(l))throw l.error(403,"No tiene permisos para gestionar módulos");try{const r=P(l),o=await r.execute("SELECT id, titulo FROM cursos_capacitacion WHERE id = ?",[t]);if(o.rows.length===0)throw l.error(404,"Curso no encontrado");const s={id:Number(o.rows[0].id),titulo:String(o.rows[0].titulo)},u=(await r.execute("SELECT * FROM modulos_curso WHERE curso_id = ? ORDER BY orden ASC",[t])).rows.map(b=>({id:Number(b.id),curso_id:Number(b.curso_id),titulo:String(b.titulo),tipo:String(b.tipo),orden:Number(b.orden),url_contenido:b.url_contenido?String(b.url_contenido):void 0})),p=u.length>0?Math.max(...u.map(b=>b.orden)):0;return{curso:s,modulos:u,ultimoOrden:p}}catch(r){throw console.error("[CAPACITACION] Error al cargar curso y módulos:",r),l.error(500,"Error al cargar el curso y sus módulos")}},$l=H(g(Ga,"s_Qu2Lf1Yr4JE")),Wa=async(l,t)=>{const a=t.params.id;if(!await ae(t))return{success:!1,message:"No tiene permisos para crear módulos"};try{const o=P(t),s=await o.execute("SELECT MAX(orden) as max_orden FROM modulos_curso WHERE curso_id = ?",[a]),i=s.rows[0].max_orden?Number(s.rows[0].max_orden)+1:1,u=`
        INSERT INTO modulos_curso
        (curso_id, titulo, tipo, orden, url_contenido)
        VALUES (?, ?, ?, ?, ?)
      `,p=await o.execute(u,[a,l.titulo,l.tipo,i,l.urlContenido||null]);return{success:!0,moduloId:Number(p.lastInsertRowid),message:"Módulo creado exitosamente",nuevoOrden:i,data:{titulo:l.titulo,tipo:l.tipo,urlContenido:l.urlContenido||void 0}}}catch(o){return console.error("[CAPACITACION] Error al crear módulo:",o),{success:!1,message:`Error al crear el módulo: ${o instanceof Error?o.message:String(o)}`}}},Ka={titulo:R.string().min(3,"El título debe tener al menos 3 caracteres"),tipo:R.enum(["video","document","quiz","interactive"]),urlContenido:R.string().optional()},zl=Y(g(Wa,"s_v50kHfSGCjA"),pe(g(Ka,"s_gXEcZBYaHeU"))),Qa=async(l,t)=>{const a=t.params.id;if(!await ae(t))return{success:!1,message:"No tiene permisos para eliminar módulos"};try{const o=P(t),s=`
        SELECT id FROM modulos_curso 
        WHERE id = ? AND curso_id = ?
      `;if((await o.execute(s,[l.moduloId,a])).rows.length===0)return{success:!1,message:"El módulo no pertenece a este curso"};const u=`
        SELECT orden FROM modulos_curso WHERE id = ?
      `,p=await o.execute(u,[l.moduloId]),b=Number(p.rows[0].orden),m=`
        DELETE FROM modulos_curso WHERE id = ?
      `;await o.execute(m,[l.moduloId]);const x=`
        UPDATE modulos_curso 
        SET orden = orden - 1 
        WHERE curso_id = ? AND orden > ?
      `;return await o.execute(x,[a,b]),{success:!0,message:"Módulo eliminado exitosamente",moduloId:l.moduloId,ordenEliminado:b}}catch(o){return console.error("[CAPACITACION] Error al eliminar módulo:",o),{success:!1,message:`Error al eliminar el módulo: ${o instanceof Error?o.message:String(o)}`}}},Za={moduloId:R.number()},Fl=Y(g(Qa,"s_eWDruomByFI"),pe(g(Za,"s_wUGDVbBZa94"))),Ja=async(l,t)=>{const a=t.params.id;if(!await ae(t))return{success:!1,message:"No tiene permisos para modificar módulos"};try{const o=P(t),s=`
        SELECT id, orden FROM modulos_curso 
        WHERE id = ? AND curso_id = ?
      `,i=await o.execute(s,[l.moduloId,a]);if(i.rows.length===0)return{success:!1,message:"El módulo no pertenece a este curso"};const u=Number(i.rows[0].orden);let p;const b=`
        SELECT COUNT(*) as total FROM modulos_curso WHERE curso_id = ?
      `,m=await o.execute(b,[a]),x=Number(m.rows[0].total);return l.direccion==="arriba"?p=Math.max(1,u-1):p=Math.min(x,u+1),p===u?{success:!0,message:"No se requirió cambio de orden"}:(await o.execute("UPDATE modulos_curso SET orden = -1 WHERE id = ?",[l.moduloId]),l.direccion==="arriba"?await o.execute("UPDATE modulos_curso SET orden = orden + 1 WHERE curso_id = ? AND orden = ?",[a,p]):await o.execute("UPDATE modulos_curso SET orden = orden - 1 WHERE curso_id = ? AND orden = ?",[a,p]),await o.execute("UPDATE modulos_curso SET orden = ? WHERE id = ?",[p,l.moduloId]),{success:!0,message:"Orden del módulo actualizado",moduloId:l.moduloId,ordenAnterior:u,ordenNuevo:p,direccion:l.direccion})}catch(o){return console.error("[CAPACITACION] Error al cambiar orden del módulo:",o),{success:!1,message:`Error al cambiar orden: ${o instanceof Error?o.message:String(o)}`}}},er={moduloId:R.number(),direccion:R.enum(["arriba","abajo"])},Bl=Y(g(Ja,"s_oNUX1rg00Mo"),pe(g(er,"s_wMKXVOQBuhk"))),lr=()=>{const[l]=A();l.value=!0},tr=()=>{var b,m,x,y,_,S,T,v,h;G();const l=$l(),t=zl(),a=Fl(),r=Bl(),o=de({curso:l.value.curso,modulos:[...l.value.modulos],ultimoOrden:l.value.ultimoOrden}),s=de({titulo:"",tipo:"video",urlContenido:""}),i=E(!1);U(k("s_p0GuES7RwIo",[t,i,o,s])),U(k("s_4mKQ1oZC36k",[a,i,o])),U(k("s_z8RFdWpjIfQ",[r,i,o]));const u=w=>{switch(G(),w){case"video":return c(zn,{class:"w-5 h-5",[n]:{class:n}},3,"wr_0");case"document":return c(ee,{class:"w-5 h-5",[n]:{class:n}},3,"wr_1");case"quiz":return c(mn,{class:"w-5 h-5",[n]:{class:n}},3,"wr_2");case"interactive":return c(Dn,{class:"w-5 h-5",[n]:{class:n}},3,"wr_3");default:return c(ee,{class:"w-5 h-5",[n]:{class:n}},3,"wr_4")}},p=w=>{switch(w){case"video":return"Video";case"document":return"Documento";case"quiz":return"Cuestionario";case"interactive":return"Interactivo";default:return w}};return e("div",null,{class:"gestionar-modulos-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},c(I,{get href(){return`/capacitacion/curso/${o.curso.id}`},class:"text-blue-600 hover:text-blue-800 flex items-center",children:[c(se,{class:"w-5 h-5 mr-1",[n]:{class:n}},3,"wr_5"),"Volver al curso"],[n]:{href:d(w=>`/capacitacion/curso/${w.curso.id}`,[o],"`/capacitacion/curso/${p0.curso.id}`"),class:n}},1,"wr_6"),1,null),e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Gestionar módulos",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-2"},["Curso: ",e("span",null,{class:"font-semibold"},d(w=>w.curso.titulo,[o],"p0.curso.titulo"),3,null)],3,null)],1,null),e("div",null,{class:"grid grid-cols-1 lg:grid-cols-2 gap-8"},[e("div",null,null,e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Módulos del curso",3,null),o.modulos.length>0?e("div",null,{class:"space-y-4"},o.modulos.map(w=>e("div",null,{class:"p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"},[e("div",null,{class:"flex items-center justify-between mb-2"},[e("div",null,{class:"flex items-center space-x-3"},[e("div",null,{class:"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"},O(w,"orden"),1,null),e("div",null,{class:"flex flex-col"},[e("h3",null,{class:"font-medium text-slate-800 dark:text-white"},O(w,"titulo"),1,null),e("div",null,{class:"flex items-center text-slate-500 dark:text-slate-400 text-sm"},[u(w.tipo),e("span",null,{class:"ml-1"},p(w.tipo),1,null)],1,null)],1,null)],1,null),e("div",null,{class:"flex items-center space-x-1"},[c(V,{action:r,children:[e("input",{value:O(w,"id")},{type:"hidden",name:"moduloId"},null,3,null),e("input",null,{type:"hidden",name:"direccion",value:"arriba"},null,3,null),e("button",{disabled:w.orden===1||i.value},{type:"submit",class:"p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 rounded disabled:opacity-50",title:"Mover hacia arriba",onClick$:k("s_OfGln3a9A7I",[i])},c(vn,{class:"w-5 h-5",[n]:{class:n}},3,"wr_7"),1,null)],[n]:{action:n}},1,"wr_8"),c(V,{action:r,children:[e("input",{value:O(w,"id")},{type:"hidden",name:"moduloId"},null,3,null),e("input",null,{type:"hidden",name:"direccion",value:"abajo"},null,3,null),e("button",{disabled:w.orden===o.modulos.length||i.value},{type:"submit",class:"p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 rounded disabled:opacity-50",title:"Mover hacia abajo",onClick$:k("s_edEBRsLY5VQ",[i])},c(xn,{class:"w-5 h-5",[n]:{class:n}},3,"wr_9"),1,null)],[n]:{action:n}},1,"wr_10"),c(V,{action:a,children:[e("input",{value:O(w,"id")},{type:"hidden",name:"moduloId"},null,3,null),e("button",null,{type:"submit",class:"p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded",title:"Eliminar módulo",disabled:d(M=>M.value,[i],"p0.value"),onClick$:k("s_ziIr4cYPL0M",[i])},c($n,{class:"w-5 h-5",[n]:{class:n}},3,"wr_11"),1,null)],[n]:{action:n}},1,"wr_12")],1,null)],1,null),w.url_contenido&&e("div",null,{class:"mt-2 text-sm text-slate-600 dark:text-slate-400 break-all"},[e("span",null,{class:"font-medium"},"URL:",3,null)," ",O(w,"url_contenido")],1,"wr_13")],1,w.id)),1,"wr_14"):e("p",null,{class:"text-slate-600 dark:text-slate-400 text-center py-4 italic"},"Este curso no tiene módulos. Añade el primer módulo usando el formulario.",3,null),((b=a.value)==null?void 0:b.success)&&e("div",null,{class:"mt-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded-md text-sm"},d(w=>w.value.message,[a],"p0.value.message"),3,"wr_15"),((m=a.value)==null?void 0:m.success)===!1&&e("div",null,{class:"mt-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm"},d(w=>w.value.message,[a],"p0.value.message"),3,"wr_16"),((x=r.value)==null?void 0:x.success)===!1&&e("div",null,{class:"mt-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm"},d(w=>w.value.message,[r],"p0.value.message"),3,"wr_17")],1,null),1,null),e("div",null,null,[e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("div",null,{class:"flex items-center mb-4"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white"},"Añadir nuevo módulo",3,null),e("div",null,{class:"w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center ml-2"},c(Ze,{class:"w-5 h-5 text-blue-600 dark:text-blue-400",[n]:{class:n}},3,"wr_18"),1,null)],1,null),((y=t.value)==null?void 0:y.success)&&e("div",null,{class:"mb-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded-md text-sm"},d(w=>w.value.message,[t],"p0.value.message"),3,"wr_19"),((_=t.value)==null?void 0:_.success)===!1&&e("div",null,{class:"mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm"},d(w=>w.value.message,[t],"p0.value.message"),3,"wr_20"),c(V,{action:t,class:"space-y-4",onSubmit$:g(lr,"s_z6zFJaxgdEc",[i]),children:[e("div",null,null,[e("label",null,{for:"titulo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Título del módulo *",3,null),e("input",null,{id:"titulo",name:"titulo",type:"text",required:!0,value:d(w=>w.titulo,[s],"p0.titulo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. Introducción al curso",onInput$:k("s_wnDr7Ttdi8w",[s])},null,3,null),((T=(S=t.value)==null?void 0:S.fieldErrors)==null?void 0:T.titulo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(w=>w.value.fieldErrors.titulo,[t],"p0.value.fieldErrors.titulo"),3,"wr_21")],1,null),e("div",null,null,[e("label",null,{for:"tipo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Tipo de módulo *",3,null),e("select",null,{id:"tipo",name:"tipo",required:!0,value:d(w=>w.tipo,[s],"p0.tipo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:k("s_Tp94Ya8WbPA",[s])},[e("option",null,{value:"video"},"Video",3,null),e("option",null,{value:"document"},"Documento",3,null),e("option",null,{value:"quiz"},"Cuestionario",3,null),e("option",null,{value:"interactive"},"Interactivo",3,null)],3,null),((h=(v=t.value)==null?void 0:v.fieldErrors)==null?void 0:h.tipo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(w=>w.value.fieldErrors.tipo,[t],"p0.value.fieldErrors.tipo"),3,"wr_22")],1,null),e("div",null,null,[e("label",null,{for:"urlContenido",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"URL del contenido (opcional)",3,null),e("input",null,{id:"urlContenido",name:"urlContenido",type:"text",value:d(w=>w.urlContenido,[s],"p0.urlContenido"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"https://ejemplo.com/contenido",onInput$:k("s_hRSw0YUjz9Q",[s])},null,3,null),e("p",null,{class:"mt-1 text-xs text-slate-500 dark:text-slate-400"},"URL al video, documento o contenido interactivo según el tipo seleccionado",3,null)],3,null),e("div",null,{class:"pt-2"},e("button",null,{type:"submit",disabled:d(w=>w.value,[i],"p0.value"),class:"w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"},i.value?c(B,{children:[e("div",null,{class:"w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"},null,3,null),e("span",null,null,"Guardando...",3,null)]},3,"wr_23"):c(B,{children:[c(je,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"wr_24"),e("span",null,null,"Guardar módulo",3,null)]},1,"wr_25"),1,null),1,null)],[n]:{action:n,class:n,onSubmit$:n}},1,"wr_26")],1,null),e("div",null,{class:"mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4"},[e("h3",null,{class:"font-medium text-blue-800 dark:text-blue-300 mb-1"},"Información sobre módulos",3,null),e("ul",null,{class:"list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1"},[e("li",null,null,"Los módulos se ordenan automáticamente según su secuencia",3,null),e("li",null,null,"Puedes cambiar el orden usando las flechas arriba/abajo",3,null),e("li",null,null,"Al eliminar un módulo, los siguientes se reordenan automáticamente",3,null),e("li",null,null,"El progreso de los usuarios es registrado por cada módulo completado",3,null)],3,null)],3,null)],1,null)],1,null)],1,"wr_27")},nr=N(g(tr,"s_r4pbfEH5xHo")),ar=Object.freeze(Object.defineProperty({__proto__:null,default:nr,useCambiarOrdenAction:Bl,useCrearModuloAction:zl,useCursoModulosLoader:$l,useEliminarModuloAction:Fl},Symbol.toStringTag,{value:"Module"})),rr=async l=>{const t=l.params.id;if(!await ae(l))throw l.error(403,"No tiene permisos para editar cursos");try{const o=await P(l).execute("SELECT * FROM cursos_capacitacion WHERE id = ?",[t]);if(o.rows.length===0)throw l.error(404,"Curso no encontrado");return{id:Number(o.rows[0].id),titulo:String(o.rows[0].titulo),descripcion:String(o.rows[0].descripcion),descripcionCompleta:String(o.rows[0].descripcion_completa||""),categoria:String(o.rows[0].categoria),instructor:o.rows[0].instructor?String(o.rows[0].instructor):"",duracion:o.rows[0].duracion?String(o.rows[0].duracion):"",imagenColor:String(o.rows[0].imagen_color||"bg-red-100 dark:bg-red-900/20")}}catch(r){throw console.error("[CAPACITACION] Error al cargar curso para editar:",r),l.error(500,"Error al cargar el curso")}},Hl=H(g(rr,"s_CYDddTxYSZU")),or=async(l,t)=>{const a=t.params.id;if(!await ae(t))return{success:!1,message:"No tiene permisos para editar cursos"};try{const o=P(t),s=`
        UPDATE cursos_capacitacion
        SET titulo = ?, 
            descripcion = ?, 
            descripcion_completa = ?, 
            categoria = ?, 
            instructor = ?, 
            duracion = ?, 
            imagen_color = ?
        WHERE id = ?
      `,i=[l.titulo,l.descripcion,l.descripcionCompleta,l.categoria,l.instructor||null,l.duracion||null,l.imagenColor,a];return await o.execute(s,i),{success:!0,cursoId:Number(a),message:"Curso actualizado exitosamente"}}catch(o){return console.error("[CAPACITACION] Error al actualizar curso:",o),{success:!1,message:`Error al actualizar el curso: ${o instanceof Error?o.message:String(o)}`}}},sr={titulo:R.string().min(5,"El título debe tener al menos 5 caracteres"),descripcion:R.string().min(10,"La descripción debe tener al menos 10 caracteres"),descripcionCompleta:R.string().min(20,"La descripción completa debe ser más detallada"),categoria:R.enum(["seguridad","derechos","prevencion","igualdad","salud"]),instructor:R.string().optional(),duracion:R.string().optional(),imagenColor:R.string().default("bg-red-100 dark:bg-red-900/20")},ql=Y(g(or,"s_qKEC0dvqMfU"),pe(g(sr,"s_7msCJgc2ikY"))),ir=()=>{const[l]=A();l.value=!0},cr=()=>{var u,p,b,m,x,y,_,S,T,v;G();const l=Hl(),t=ql(),a=il(),r=de({titulo:l.value.titulo,descripcion:l.value.descripcion,descripcionCompleta:l.value.descripcionCompleta,categoria:l.value.categoria,instructor:l.value.instructor,duracion:l.value.duracion,imagenColor:l.value.imagenColor}),o=[{id:"bg-red-100 dark:bg-red-900/20",nombre:"Rojo"},{id:"bg-blue-100 dark:bg-blue-900/20",nombre:"Azul"},{id:"bg-green-100 dark:bg-green-900/20",nombre:"Verde"},{id:"bg-yellow-100 dark:bg-yellow-900/20",nombre:"Amarillo"},{id:"bg-purple-100 dark:bg-purple-900/20",nombre:"Morado"},{id:"bg-indigo-100 dark:bg-indigo-900/20",nombre:"Índigo"},{id:"bg-pink-100 dark:bg-pink-900/20",nombre:"Rosa"}],s=[{id:"seguridad",nombre:"Seguridad y Salud en el Trabajo"},{id:"derechos",nombre:"Derechos Laborales Básicos"},{id:"prevencion",nombre:"Prevención del Acoso Laboral"},{id:"igualdad",nombre:"Igualdad Salarial y No Discriminación"},{id:"salud",nombre:"Gestión del Estrés y Salud Mental"}],i=E(!1);return U(k("s_DGiYN3ezU0M",[t,i,a])),e("div",null,{class:"editar-curso-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},c(I,{get href(){return`/capacitacion/curso/${l.value.id}`},class:"text-blue-600 hover:text-blue-800 flex items-center",children:[c(se,{class:"w-5 h-5 mr-1",[n]:{class:n}},3,"eL_0"),"Volver al curso"],[n]:{href:d(h=>`/capacitacion/curso/${h.value.id}`,[l],"`/capacitacion/curso/${p0.value.id}`"),class:n}},1,"eL_1"),1,null),e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Editar curso de capacitación",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-6"},['Actualiza la información del curso "',d(h=>h.value.titulo,[l],"p0.value.titulo"),'"'],3,null)],1,null),((u=t.value)==null?void 0:u.success)&&e("div",null,{class:"bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-6"},[e("p",null,null,d(h=>h.value.message,[t],"p0.value.message"),3,null),e("p",null,{class:"text-sm mt-1"},"Redirigiendo al curso actualizado...",3,null)],3,"eL_2"),((p=t.value)==null?void 0:p.success)===!1&&e("div",null,{class:"bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6"},e("p",null,null,d(h=>h.value.message,[t],"p0.value.message"),3,null),3,"eL_3"),c(V,{action:t,class:"bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700",onSubmit$:g(ir,"s_gNldimEWzt0",[i]),children:e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"titulo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Título del curso *",3,null),e("input",null,{id:"titulo",name:"titulo",type:"text",required:!0,value:d(h=>h.titulo,[r],"p0.titulo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. Seguridad y Salud en el Trabajo",onInput$:k("s_NfM10xdlMmI",[r])},null,3,null),((m=(b=t.value)==null?void 0:b.fieldErrors)==null?void 0:m.titulo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(h=>h.value.fieldErrors.titulo,[t],"p0.value.fieldErrors.titulo"),3,"eL_4")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción breve *",3,null),e("input",null,{id:"descripcion",name:"descripcion",type:"text",required:!0,value:d(h=>h.descripcion,[r],"p0.descripcion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Breve descripción que aparecerá en la lista de cursos",onInput$:k("s_uvjRlfaN3a0",[r])},null,3,null),((y=(x=t.value)==null?void 0:x.fieldErrors)==null?void 0:y.descripcion)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(h=>h.value.fieldErrors.descripcion,[t],"p0.value.fieldErrors.descripcion"),3,"eL_5")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcionCompleta",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción completa *",3,null),e("textarea",null,{id:"descripcionCompleta",name:"descripcionCompleta",required:!0,value:d(h=>h.descripcionCompleta,[r],"p0.descripcionCompleta"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-32",placeholder:"Descripción detallada del curso, objetivos, a quién va dirigido, etc.",onInput$:k("s_ue0ZPtmIQeM",[r])},null,3,null),((S=(_=t.value)==null?void 0:_.fieldErrors)==null?void 0:S.descripcionCompleta)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(h=>h.value.fieldErrors.descripcionCompleta,[t],"p0.value.fieldErrors.descripcionCompleta"),3,"eL_6")],1,null),e("div",null,null,[e("label",null,{for:"categoria",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Categoría *",3,null),e("select",null,{id:"categoria",name:"categoria",required:!0,value:d(h=>h.categoria,[r],"p0.categoria"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:k("s_9WesXJLVNgs",[r])},s.map(h=>e("option",{value:O(h,"id")},null,h.nombre,1,h.id)),1,null),((v=(T=t.value)==null?void 0:T.fieldErrors)==null?void 0:v.categoria)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},d(h=>h.value.fieldErrors.categoria,[t],"p0.value.fieldErrors.categoria"),3,"eL_7")],1,null),e("div",null,null,[e("label",null,{for:"imagenColor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Color de fondo",3,null),e("select",null,{id:"imagenColor",name:"imagenColor",value:d(h=>h.imagenColor,[r],"p0.imagenColor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:k("s_Gp0X0TDBMyw",[r])},o.map(h=>e("option",{value:O(h,"id")},null,h.nombre,1,h.id)),1,null)],1,null),e("div",null,null,[e("label",null,{for:"instructor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Instructor (opcional)",3,null),e("input",null,{id:"instructor",name:"instructor",type:"text",value:d(h=>h.instructor,[r],"p0.instructor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Nombre del instructor",onInput$:k("s_04Nz201Fg3A",[r])},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"duracion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Duración (opcional)",3,null),e("input",null,{id:"duracion",name:"duracion",type:"text",value:d(h=>h.duracion,[r],"p0.duracion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. 2 horas, 3 semanas, etc.",onInput$:k("s_2MK076kynQ0",[r])},null,3,null)],3,null),e("div",null,{class:"col-span-1 md:col-span-2 flex justify-end"},e("button",null,{type:"submit",disabled:d(h=>h.value,[i],"p0.value"),class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"},i.value?c(B,{children:[e("div",null,{class:"w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"},null,3,null),e("span",null,null,"Guardando...",3,null)]},3,"eL_8"):c(B,{children:[c(je,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"eL_9"),e("span",null,null,"Actualizar curso",3,null)]},1,"eL_10"),1,null),1,null)],1,null),[n]:{action:n,class:n,onSubmit$:n}},1,"eL_11")],1,"eL_12")},ur=N(g(cr,"s_R64jpZif54M")),dr=Object.freeze(Object.defineProperty({__proto__:null,default:ur,useCursoLoader:Hl,useEditarCursoAction:ql},Symbol.toStringTag,{value:"Module"})),gr=async l=>{const t=l.params.id;try{const a=P(l),r=await a.execute("SELECT * FROM cursos_capacitacion WHERE id = ?",[t]);if(r.rows.length===0)throw l.error(404,"Curso no encontrado");const o={id:Number(r.rows[0].id),titulo:String(r.rows[0].titulo),descripcion:String(r.rows[0].descripcion),descripcion_completa:String(r.rows[0].descripcion_completa||""),categoria:String(r.rows[0].categoria),instructor:r.rows[0].instructor?String(r.rows[0].instructor):void 0,duracion:r.rows[0].duracion?String(r.rows[0].duracion):void 0,imagen_color:String(r.rows[0].imagen_color||"bg-red-100 dark:bg-red-900/20"),creado_por:Number(r.rows[0].creado_por)},i=(await a.execute("SELECT * FROM modulos_curso WHERE curso_id = ? ORDER BY orden ASC",[t])).rows.map(y=>({id:Number(y.id),curso_id:Number(y.curso_id),titulo:String(y.titulo),tipo:String(y.tipo),orden:Number(y.orden),url_contenido:y.url_contenido?String(y.url_contenido):void 0})),p=(await a.execute("SELECT * FROM recursos_curso WHERE curso_id = ?",[t])).rows.map(y=>({id:Number(y.id),curso_id:Number(y.curso_id),titulo:String(y.titulo),tipo:String(y.tipo),url_recurso:y.url_recurso?String(y.url_recurso):void 0})),b=await ae(l),m=X(l);let x=[];return m&&(x=(await a.execute("SELECT modulo_id FROM progreso_curso WHERE usuario_id = ? AND completado = 1",[m])).rows.map(_=>Number(_.modulo_id))),{curso:o,modulos:i,recursos:p,puedeGestionar:b,modulosCompletados:x}}catch(a){throw console.error("[CAPACITACION] Error al cargar curso:",a),l.error(500,"Error al cargar el curso")}},Vl=H(g(gr,"s_0EzdgdE9378")),pr=()=>{G(),ge();const l=Vl(),t=E(null),a=r=>l.value.modulosCompletados.includes(r);return e("div",null,{class:"curso-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},c(I,{href:"/capacitacion",class:"text-blue-600 hover:text-blue-800 flex items-center",children:[c(se,{class:"w-5 h-5 mr-1",[n]:{class:n}},3,"E6_0"),"Volver a capacitaciones"],[n]:{href:n,class:n}},1,"E6_1"),1,null),e("div",null,{class:"flex flex-col md:flex-row justify-between items-start md:items-center mb-4"},[e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2 md:mb-0"},d(r=>r.value.curso.titulo,[l],"p0.value.curso.titulo"),3,null),l.value.puedeGestionar&&e("div",null,{class:"flex space-x-2"},[c(I,{get href(){return`/capacitacion/curso/${l.value.curso.id}/modulos/crear`},class:"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center",children:[c(Ze,{class:"w-4 h-4 mr-1",[n]:{class:n}},3,"E6_2"),"Crear módulos"],[n]:{href:d(r=>`/capacitacion/curso/${r.value.curso.id}/modulos/crear`,[l],"`/capacitacion/curso/${p0.value.curso.id}/modulos/crear`"),class:n}},1,"E6_3"),c(I,{get href(){return`/capacitacion/curso/${l.value.curso.id}/editar`},class:"bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center",children:[c(Ln,{class:"w-4 h-4 mr-1",[n]:{class:n}},3,"E6_4"),"Editar curso"],[n]:{href:d(r=>`/capacitacion/curso/${r.value.curso.id}/editar`,[l],"`/capacitacion/curso/${p0.value.curso.id}/editar`"),class:n}},1,"E6_5")],1,"E6_6")],1,null),e("div",null,{class:"text-sm flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-400 mb-4"},[l.value.curso.instructor&&e("div",null,null,["Instructor: ",e("span",null,{class:"font-medium"},d(r=>r.value.curso.instructor,[l],"p0.value.curso.instructor"),3,null)],3,"E6_7"),l.value.curso.duracion&&e("div",null,null,["Duración: ",e("span",null,{class:"font-medium"},d(r=>r.value.curso.duracion,[l],"p0.value.curso.duracion"),3,null)],3,"E6_8"),e("div",null,null,["Categoría: ",e("span",null,{class:"font-medium capitalize"},d(r=>r.value.curso.categoria,[l],"p0.value.curso.categoria"),3,null)],3,null)],1,null)],1,null),e("div",null,{class:"grid grid-cols-1 lg:grid-cols-3 gap-8"},[e("div",null,{class:"lg:col-span-2"},[e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Descripción del curso",3,null),e("div",null,{class:"prose dark:prose-invert max-w-none"},e("p",null,{class:"text-slate-600 dark:text-slate-300"},d(r=>r.value.curso.descripcion_completa||r.value.curso.descripcion,[l],"p0.value.curso.descripcion_completa||p0.value.curso.descripcion"),3,null),3,null)],3,null),e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Módulos del curso",3,null),l.value.modulos.length>0?e("div",null,{class:"space-y-4"},l.value.modulos.map((r,o)=>G(e("div",{class:`p-4 rounded-lg border ${a(r.id)?"border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20":"border-slate-200 dark:border-slate-700"}`},null,e("div",null,{class:"flex items-center justify-between"},[e("div",null,{class:"flex items-center space-x-3"},[e("div",null,{class:"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"},o+1,1,null),e("h3",null,{class:"font-medium text-slate-800 dark:text-white"},O(r,"titulo"),1,null),a(r.id)&&c(hn,{class:"w-5 h-5 text-green-500",[n]:{class:n}},3,"E6_9")],1,null),e("button",{onClick$:k("s_mcFEtcamfSA",[r,t])},{class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"},[c(Ve,{class:"w-4 h-4 mr-1",[n]:{class:n}},3,"E6_10"),"Iniciar"],0,null)],1,null),1,r.id))),1,"E6_11"):e("p",null,{class:"text-slate-600 dark:text-slate-400 text-center py-4"},"No hay módulos disponibles en este curso.",3,null)],1,null)],1,null),e("div",null,{class:"space-y-6"},[l.value.recursos.length>0&&e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Materiales descargables",3,null),e("div",null,{class:"space-y-3"},l.value.recursos.map(r=>e("div",null,{class:"flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"},[e("div",null,{class:"flex items-center"},e("span",null,{class:"truncate"},O(r,"titulo"),1,null),1,null),e("button",{onClick$:k("s_K7p3bEiVZj0",[r])},{class:"flex items-center text-blue-600 hover:text-blue-800"},c(Oe,{class:"w-5 h-5",[n]:{class:n}},3,"E6_12"),0,null)],1,r.id)),1,null)],1,"E6_13"),e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Tu progreso",3,null),l.value.modulos.length>0?e("div",null,{class:"space-y-4"},[e("div",null,{class:"w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"},e("div",null,{class:"h-full bg-green-500",style:d(r=>({width:r.value.modulos.length>0?`${r.value.modulosCompletados.length/r.value.modulos.length*100}%`:"0%"}),[l],'{width:p0.value.modulos.length>0?`${p0.value.modulosCompletados.length/p0.value.modulos.length*100}%`:"0%"}')},null,3,null),3,null),e("p",null,{class:"text-center text-sm text-slate-600 dark:text-slate-400"},[d(r=>r.value.modulosCompletados.length,[l],"p0.value.modulosCompletados.length")," de ",d(r=>r.value.modulos.length,[l],"p0.value.modulos.length")," módulos completados"],3,null)],3,"E6_14"):e("p",null,{class:"text-slate-600 dark:text-slate-400 text-center py-4"},"No hay módulos disponibles en este curso.",3,null)],1,null)],1,null)],1,null)],1,"E6_15")},mr=N(g(pr,"s_OmDr6GDdzwg")),br=Object.freeze(Object.defineProperty({__proto__:null,default:mr,useCursoLoader:Vl},Symbol.toStringTag,{value:"Module"})),hr=()=>{const t=ge().params.categoria,r={"contratos-laborales":"Contratos Laborales",despidos:"Cartas de Despido",demandas:"Demandas Laborales",reclamaciones:"Reclamaciones",afiliaciones:"Afiliaciones",convenios:"Convenios Colectivos",conflictos:"Conflictos Laborales",derechos:"Derechos Laborales"}[t]||"Categoría";return e("div",null,{class:"categoria-page"},[e("div",null,{class:"page-header"},[c(I,{href:"/documentos-legales/",class:"back-link",children:[c(se,{class:"w-5 h-5",[n]:{class:n}},3,"2I_0"),e("span",null,null,"Volver",3,null)],[n]:{href:n,class:n}},1,"2I_1"),e("h1",null,{class:"page-title"},r,1,null),e("p",null,{class:"page-description"},"Selecciona una plantilla para generar un documento legal",3,null)],1,null),e("div",null,{class:"page-content"},e("div",null,{class:"info-message"},[e("p",null,null,["Las plantillas para la categoría ",e("strong",null,null,r,1,null)," están en desarrollo."],1,null),e("p",null,null,["Mientras tanto, puedes usar el ",c(I,{href:"/documentos-legales/asistente/",class:"link-text",children:"Asistente de IA",[n]:{href:n,class:n}},3,"2I_2")," para generar documentos personalizados."],1,null)],1,null),1,null),e("style",null,null,`
        .categoria-page {
          padding: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-decoration: none;
        }
        
        .back-link:hover {
          color: #111827;
        }
        
        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-description {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .page-content {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 2rem;
        }
        
        .info-message {
          background-color: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 0.375rem;
          padding: 1.5rem;
          text-align: center;
        }
        
        .info-message p {
          margin-bottom: 0.75rem;
        }
        
        .info-message p:last-child {
          margin-bottom: 0;
        }
        
        .link-text {
          color: #e53e3e;
          text-decoration: none;
          font-weight: 500;
        }
        
        .link-text:hover {
          text-decoration: underline;
        }
        `,3,null)],1,"2I_3")},fr=N(g(hr,"s_luOHToyI85g")),xr=Object.freeze(Object.defineProperty({__proto__:null,default:fr},Symbol.toStringTag,{value:"Module"})),vr=async l=>{var r;const t=l.params.id,a=(r=l.cookie.get("auth_token"))==null?void 0:r.value;console.log(`PDF Visor: Buscando documento con ID: ${t}`),console.log(`PDF Visor: Usuario actual: ${a}`);try{await Z(l,`CREATE TABLE IF NOT EXISTS documentos_legales (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        titulo TEXT NOT NULL,
        categoria TEXT NOT NULL,
        fecha TEXT NOT NULL,
        estado TEXT NOT NULL,
        origen TEXT NOT NULL,
        contenido TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);try{await Z(l,"SELECT contenido FROM documentos_legales LIMIT 1"),console.log("PDF Visor: La columna contenido existe en la tabla")}catch{console.log("PDF Visor: Añadiendo columna contenido a la tabla documentos_legales"),await Z(l,"ALTER TABLE documentos_legales ADD COLUMN contenido TEXT"),console.log("PDF Visor: Columna contenido añadida correctamente")}const o=await Z(l,"SELECT id, titulo FROM documentos_legales LIMIT 10");console.log(`PDF Visor: Documentos en la base de datos (máximo 10): ${o.rows.length}`),o.rows.forEach((i,u)=>{console.log(`PDF Visor: Doc ${u+1}: ID=${i.id}, Título=${i.titulo}`)}),console.log(`PDF Visor: Obteniendo documento específico con ID: ${t}`);const s=await Z(l,"SELECT titulo, categoria, fecha, contenido, user_id, origen FROM documentos_legales WHERE id = ?",[t]);return s.rows.length===0?(console.log(`PDF Visor: No se encontró ningún documento con ID: ${t}`),{success:!1,titulo:`Documento ${t}`,categoria:"Categoría no disponible",fecha:new Date().toISOString().split("T")[0],contenido:null,userId:null,origen:null}):(console.log(`PDF Visor: Documento encontrado: ${s.rows[0].titulo} (Origen: ${s.rows[0].origen})`),{success:!0,titulo:s.rows[0].titulo,categoria:s.rows[0].categoria,fecha:s.rows[0].fecha,contenido:s.rows[0].contenido,userId:s.rows[0].user_id,origen:s.rows[0].origen})}catch(o){return console.error("PDF Visor: Error al obtener información del documento:",o),{success:!1,titulo:`Documento ${t}`,categoria:"Categoría no disponible",fecha:new Date().toISOString().split("T")[0],contenido:null,userId:null,origen:null}}},Yl=H(g(vr,"s_3EOF7tyPTCM")),Xl=l=>{if(!l)return"";let t=l.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");return t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t},yr=async()=>{const[l,t,a]=A();if(!window.html2pdf){alert("La biblioteca de PDF está cargando. Por favor, intente nuevamente en unos segundos.");return}const r=document.createElement("div");r.innerHTML=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t.value.titulo}</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
          }
          h1 {
            font-size: 16pt;
            text-align: center;
            margin-bottom: 20px;
          }
          h2 {
            font-size: 14pt;
            margin-top: 15px;
            margin-bottom: 10px;
          }
          p {
            margin-bottom: 10px;
            text-align: justify;
          }
          ul, ol {
            margin-bottom: 10px;
          }
          .document-header {
            text-align: right;
            margin-bottom: 30px;
          }
          .document-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10pt;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="document-content">
          ${a||`
            <h1>${t.value.titulo}</h1>
            <p>Este es un documento legal generado por el sistema.</p>
            <p>ID del documento: ${l}</p>
            <p>Fecha: ${new Date(t.value.fecha).toLocaleDateString()}</p>
            <hr>
            <p>El contenido del documento no está disponible.</p>
          `}
        </div>
        <div class="document-footer">
          <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          <p>Sistema Legal DAIOFF</p>
        </div>
      </body>
      </html>
    `,document.body.appendChild(r);try{const o=t.value.titulo.toLowerCase().replace(/[áàäâ]/g,"a").replace(/[éèëê]/g,"e").replace(/[íìïî]/g,"i").replace(/[óòöô]/g,"o").replace(/[úùüû]/g,"u").replace(/ñ/g,"n").replace(/[^a-z0-9]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),s={margin:[15,15],filename:`${o}-${l}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};alert("Generando PDF. Por favor espere..."),await window.html2pdf(r,s),console.log("PDF generado y descargado correctamente")}catch(o){console.error("Error al generar el PDF:",o),alert("Ocurrió un error al generar el PDF. Por favor, intente de nuevo.")}finally{document.body.removeChild(r)}},wr=()=>{var t,a;const l=document.getElementById("pdf-iframe");l&&((t=l.contentWindow)==null||t.focus(),(a=l.contentWindow)==null||a.print())},kr=()=>{const t=ge().params.id,a=Yl(),r=(()=>a.value.contenido?Xl(a.value.contenido):"")(),o=(p,b="")=>{const m=b||`
      <h1>${p}</h1>
      <p>Este es un documento legal generado por el sistema.</p>
      <p>ID del documento: ${t}</p>
      <p>Fecha: ${new Date().toLocaleDateString()}</p>
      <hr>
      <p>El contenido real del documento aún no ha sido generado o no está disponible.</p>
    `,x=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${p}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            margin: 2cm;
            line-height: 1.5;
          }
          h1 {
            text-align: center;
            margin-bottom: 2cm;
          }
        </style>
      </head>
      <body>
        ${m}
      </body>
      </html>
    `;return`data:text/html;charset=utf-8,${encodeURIComponent(x)}`},s=(()=>o(a.value.titulo,r||""))();U(k("s_c9jpPQjKWUs"));const i=g(yr,"s_NxRHMEJOuAI",[t,a,r]),u=g(wr,"s_TTBOJXlgnrU");return e("div",null,{class:"pdf-viewer-page"},[e("div",null,{class:"viewer-header"},[e("div",null,{class:"header-left"},[c(I,{href:"/documentos-legales/mis-documentos/",class:"back-link",children:[c(se,{class:"w-5 h-5",[n]:{class:n}},3,"4X_0"),e("span",null,null,"Volver",3,null)],[n]:{href:n,class:n}},1,"4X_1"),e("h1",null,{class:"page-title"},d(p=>p.value.titulo,[a],"p0.value.titulo"),3,null),e("div",null,{class:"document-meta"},[e("div",null,{class:"meta-item"},[c(Tl,{class:"w-4 h-4",[n]:{class:n}},3,"4X_2"),e("span",null,null,d(p=>p.value.categoria,[a],"p0.value.categoria"),3,null)],1,null),e("div",null,{class:"meta-item"},[c(Se,{class:"w-4 h-4",[n]:{class:n}},3,"4X_3"),e("span",null,null,new Date(a.value.fecha).toLocaleDateString(),1,null)],1,null),a.value.origen&&e("div",null,{class:"meta-item"},e("span",null,null,["Origen: ",d(p=>p.value.origen,[a],"p0.value.origen")],3,null),3,"4X_4")],1,null)],1,null),e("div",null,{class:"header-actions"},[e("button",null,{class:"action-btn",onClick$:i},[c(Oe,{class:"w-5 h-5",[n]:{class:n}},3,"4X_5"),e("span",null,null,"Descargar",3,null)],1,null),e("button",null,{class:"action-btn",onClick$:u},[c(Nn,{class:"w-5 h-5",[n]:{class:n}},3,"4X_6"),e("span",null,null,"Imprimir",3,null)],1,null)],1,null)],1,null),e("div",null,{class:"viewer-content"},e("iframe",{src:s,title:`Documento Legal ${t}`,onError$:k("s_UaNZO831hZo",[t,s])},{id:"pdf-iframe",class:"pdf-iframe"},null,2,null),1,null),e("style",null,null,`
        .pdf-viewer-page {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
        }
        
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          text-decoration: none;
        }
        
        .back-link:hover {
          color: #111827;
        }
        
        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }
        
        .document-meta {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background-color: #f9fafb;
          border-color: #9ca3af;
        }
        
        .viewer-content {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          min-height: 70vh;
          overflow: hidden;
          height: calc(100vh - 150px);
          display: flex;
          position: relative;
        }
        
        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .pdf-error {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
          padding: 2rem;
          text-align: center;
          color: #ef4444;
        }
        
        .pdf-error h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .pdf-error p {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        
        .link-text {
          display: inline-block;
          color: #e53e3e;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background-color: #fee2e2;
          border-radius: 0.25rem;
        }
        
        .link-text:hover {
          background-color: #fecaca;
        }
        
        @media (max-width: 768px) {
          .viewer-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        `,3,null)],1,"4X_7")},_r=N(g(kr,"s_0A7MEUtq05E")),Er=Object.freeze(Object.defineProperty({__proto__:null,_auto_convertMarkdownToHtml:Xl,default:_r,useDocumentoInfo:Yl},Symbol.toStringTag,{value:"Module"})),Tr=`
    .hero {
      /* Updated gradient for DAI Off */
      background-image: linear-gradient(to right, rgba(220, 38, 38, 0.9), rgba(185, 28, 28, 0.8)), url('/images/legal-bg.jpg'); /* Replace with a relevant background image */
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
      @apply bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg text-white inline-flex shadow-md;
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
      @apply absolute left-3 top-2 h-full w-0.5 bg-red-200 dark:bg-red-900;
    }

    .timeline-item:last-child:before {
      @apply h-6;
    }

    .timeline-circle {
      /* Updated timeline circle color */
      @apply absolute left-0 top-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow;
    }
  `,Sr=()=>{Me(g(Tr,"s_0qQ3k6L1bs0"));const l=[E(),E(),E()];return U(k("s_XQghmw02tBA")),e("div",null,{class:"flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 page-content"},[e("div",null,{class:"hero py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center hero-section",style:{viewTransitionName:"about-hero"}},e("div",null,{class:"max-w-4xl text-center"},[e("h1",null,{class:"text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white"},"Quienes Somos",3,null),e("p",null,{class:"text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto"},"En DAI Off entendemos los retos del entorno laboral moderno y brindamos asesoramiento legal laboral personalizado con tecnología avanzada.",3,null),e("div",null,{class:"flex flex-col sm:flex-row gap-4 justify-center"},[c(I,{href:"/chat",class:"px-8 py-3 bg-white text-red-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-md",children:"Consulta Ahora",[n]:{href:n,class:n}},3,"iL_0"),c(I,{href:"/contact",class:"px-8 py-3 bg-red-700 border border-white text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-center shadow-md",children:"Contáctanos",[n]:{href:n,class:n}},3,"iL_1")],1,null)],1,null),1,null),e("section",{ref:l[0]},{class:"py-16 px-4 bg-white dark:bg-gray-800 section",style:{viewTransitionName:"about-mission"}},e("div",null,{class:"max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center"},[e("div",null,null,[e("span",null,{class:"inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-full mb-3"},"Nuestro Propósito",3,null),e("h2",null,{class:"text-3xl font-bold mb-4 text-gray-900 dark:text-white"},"Nuestra Misión y Visión",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-6"},"DAI Off está dedicado a hacer el asesoramiento legal laboral accesible, claro y efectivo para todos. Creemos que entender tus derechos laborales abre puertas a nuevas oportunidades y crecimiento profesional.",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300"},"Nuestra visión es crear una comunidad de trabajadores informados, eliminando barreras y fomentando relaciones laborales justas a través del poder del conocimiento legal.",3,null)],3,null),e("div",null,{class:"flex justify-center"},c(Pn,{class:"w-48 h-48 text-red-500 dark:text-red-400 opacity-80",[n]:{class:n}},3,"iL_2"),1,null)],1,null),1,null),e("section",{ref:l[1]},{class:"py-16 px-4 bg-gray-50 dark:bg-gray-900 section",style:{viewTransitionName:"about-values"}},e("div",null,{class:"max-w-7xl mx-auto"},[e("h2",null,{class:"text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"},"Nuestros Valores",3,null),e("div",null,{class:"grid md:grid-cols-2 lg:grid-cols-3 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item",style:{viewTransitionName:"value-card-1"}},[e("div",null,{class:"icon-gradient mb-4"},c(Ae,{class:"w-6 h-6",[n]:{class:n}},3,"iL_3"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Experiencia Confirmada",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Contamos con tecnología especializada en legislación laboral, estatuto de trabajadores y convenios colectivos por sector.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item",style:{viewTransitionName:"value-card-2"}},[e("div",null,{class:"icon-gradient mb-4"},c(Ye,{class:"w-6 h-6",[n]:{class:n}},3,"iL_4"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Transparencia Total",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Garantizamos claridad en cada paso del proceso para asegurar que recibas orientación sin ninguna sorpresa.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item",style:{viewTransitionName:"value-card-3"}},[e("div",null,{class:"icon-gradient mb-4"},c(En,{class:"w-6 h-6",[n]:{class:n}},3,"iL_5"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Compromiso con el Cliente",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Impulsados por nuestra pasión por la justicia laboral y el respeto por las necesidades individuales de cada trabajador.",3,null)],1,null)],1,null)],1,null),1,null),e("section",{ref:l[2]},{class:"py-16 px-4 bg-white dark:bg-gray-800 section",style:{viewTransitionName:"about-approach"}},e("div",null,{class:"max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center"},[e("div",null,{class:"flex justify-center md:order-last"},c(Tn,{class:"w-48 h-48 text-red-500 dark:text-red-400 opacity-80",[n]:{class:n}},3,"iL_6"),1,null),e("div",null,{class:"md:order-first"},[e("span",null,{class:"inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-full mb-3"},"Cómo Trabajamos",3,null),e("h2",null,{class:"text-3xl font-bold mb-4 text-gray-900 dark:text-white"},"Nuestro Enfoque de Asesoría",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-4"},"Combinamos conocimiento legal, casos reales y herramientas de IA avanzadas como nuestro asistente DAI Off, para crear una experiencia de asesoramiento personalizada y efectiva.",3,null),e("ul",null,{class:"space-y-3 text-gray-600 dark:text-gray-300"},[e("li",null,{class:"flex items-start"},[c(El,{class:"w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0",[n]:{class:n}},3,"iL_7"),e("span",null,null,"Enfoque en soluciones prácticas y aplicables desde el primer momento.",3,null)],1,null),e("li",null,{class:"flex items-start"},[c(De,{class:"w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0",[n]:{class:n}},3,"iL_8"),e("span",null,null,"Información actualizada con las últimas normativas laborales y convenios.",3,null)],1,null),e("li",null,{class:"flex items-start"},[c(fe,{class:"w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0",[n]:{class:n}},3,"iL_9"),e("span",null,null,"Integración de IA para un asesoramiento personalizado y preciso.",3,null)],1,null)],1,null)],1,null)],1,null),1,null),e("div",null,{class:"py-16 px-4 text-center bg-gray-50 dark:bg-gray-900",style:{viewTransitionName:"about-cta"}},e("div",null,{class:"max-w-3xl mx-auto"},[e("h2",null,{class:"text-3xl font-bold mb-6 text-red-700 dark:text-red-300"},"¿Listo para proteger tus derechos laborales?",3,null),e("p",null,{class:"text-lg mb-8 text-gray-600 dark:text-gray-300"},"Únete a la comunidad DAI Off hoy y descubre el poder de contar con asesoría legal laboral personalizada.",3,null),c(I,{href:"/auth",class:"inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300",style:{viewTransitionName:"cta-button"},children:["Registrarse Ahora",c(yl,{class:"w-5 h-5 ml-2",[n]:{class:n}},3,"iL_10")],[n]:{href:n,class:n,style:n}},1,"iL_11")],1,null),1,null)],1,"iL_12")},Cr=N(g(Sr,"s_tPTKrVT0pR0")),Ar={title:"Quienes Somos | DAI Off",meta:[{name:"description",content:"Conoce más sobre DAI Off, nuestra misión, valores y enfoque innovador en asesoría legal laboral con tecnología avanzada. Protege tus derechos laborales."}]},Ir=Object.freeze(Object.defineProperty({__proto__:null,default:Cr,head:Ar},Symbol.toStringTag,{value:"Module"})),Rr=async l=>{const t=X(l);return t?{absences:(await Z(l,"SELECT * FROM user_absences WHERE user_id = ? ORDER BY start_date DESC",[t])).rows}:{absences:[]}},Gl=H(g(Rr,"s_ZN1KWUNAAvk")),Dr=async(l,t)=>{const a=X(t);if(!a)return{success:!1,error:"Usuario no autenticado"};try{return await Z(t,`INSERT INTO user_absences (user_id, start_date, end_date, absence_type, description)
      VALUES (?, ?, ?, ?, ?)`,[a,l.start_date,l.end_date,l.absence_type,l.description||""]),{success:!0,message:"Ausencia registrada correctamente"}}catch(r){return console.error("Error al registrar ausencia:",r),{success:!1,error:"Error al registrar la ausencia. Inténtalo de nuevo."}}},Wl=Y(g(Dr,"s_j0SjgjJTC0s")),Lr=async(l,t)=>{const a=X(t);if(!a)return{success:!1,error:"Usuario no autenticado"};try{return await Z(t,"DELETE FROM user_absences WHERE id = ? AND user_id = ?",[l.absence_id,a]),{success:!0,message:"Ausencia eliminada correctamente"}}catch(r){return console.error("Error al eliminar ausencia:",r),{success:!1,error:"Error al eliminar la ausencia. Inténtalo de nuevo."}}},Kl=Y(g(Lr,"s_f9T1qAv6HXU")),Nr=()=>{const[l,t,a]=A(),r=new Date(a.value,t.value,1),o=new Date(a.value,t.value+1,0),s=[],i=r.getDay(),u=new Date(a.value,t.value,0).getDate();for(let m=i-1;m>=0;m--){const x=new Date(a.value,t.value-1,u-m);s.push(x)}for(let m=1;m<=o.getDate();m++){const x=new Date(a.value,t.value,m);s.push(x)}const b=6-o.getDay();for(let m=1;m<=b;m++){const x=new Date(a.value,t.value+1,m);s.push(x)}l.value=s},Mr=()=>{const[l,t,a]=A();l.value===0?(l.value=11,t.value--):l.value--,a()},Or=()=>{const[l,t,a]=A();l.value===11?(l.value=0,t.value++):l.value++,a()},jr=l=>["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][l],Pr=()=>{const[l,t]=A();setTimeout(()=>{t.value=null,l.value=null},5e3)},Ur=()=>{G();const l=Gl(),t=Wl(),a=Kl(),r=E(!1),o=E(new Date().getMonth()),s=E(new Date().getFullYear()),i=E([]),u=E(null),p=E(null),b=g(Nr,"s_RRlGTjIC0os",[i,o,s]),m=g(Mr,"s_vmLY69sX3yA",[o,s,b]),x=g(Or,"s_F0lvdVGthS0",[o,s,b]),y=h=>!l.value.absences||!Array.isArray(l.value.absences)?!1:l.value.absences.some(w=>{const M=new Date(w.start_date),j=new Date(w.end_date);return M.setHours(0,0,0,0),j.setHours(0,0,0,0),h.setHours(0,0,0,0),h>=M&&h<=j}),_=h=>{if(!l.value.absences||!Array.isArray(l.value.absences))return null;const w=l.value.absences.find(M=>{const j=new Date(M.start_date),f=new Date(M.end_date);return j.setHours(0,0,0,0),f.setHours(0,0,0,0),h.setHours(0,0,0,0),h>=j&&h<=f});return w&&w.absence_type?String(w.absence_type):null},S=h=>{switch(h){case"illness":return"bg-red-200 text-red-800";case"vacation":return"bg-blue-200 text-blue-800";case"personal":return"bg-orange-200 text-orange-800";case"other":return"bg-purple-200 text-purple-800";default:return"bg-gray-200 text-gray-800"}},T=g(jr,"s_AWa0nzatgWs"),v=g(Pr,"s_6JItnLXN84E",[p,u]);return U(k("s_20w0tZCU43c",[b])),U(k("s_oz7gFAWyM3M",[v,p,t,r,u])),U(k("s_v0xs7guL43U",[v,a,p,u])),e("div",null,{class:"space-y-6"},[u.value&&e("div",null,{class:"bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative",role:"alert"},e("span",null,{class:"block sm:inline"},d(h=>h.value,[u],"p0.value"),3,null),3,"X1_0"),p.value&&e("div",null,{class:"bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative",role:"alert"},e("span",null,{class:"block sm:inline"},d(h=>h.value,[p],"p0.value"),3,null),3,"X1_1"),e("div",null,{class:"flex justify-between items-center mb-4"},[e("h2",null,{class:"text-xl font-semibold flex items-center"},[c(Se,{class:"w-6 h-6 mr-2",[n]:{class:n}},3,"X1_2"),T(o.value)," ",d(h=>h.value,[s],"p0.value")],1,null),e("div",null,{class:"flex space-x-2"},[e("button",null,{class:"px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600","aria-label":"Mes anterior",onClick$:m},"<",3,null),e("button",null,{class:"px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600","aria-label":"Mes siguiente",onClick$:x},">",3,null),e("button",null,{class:"flex items-center px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600",onClick$:k("s_CWt4VIjLirA",[r])},r.value?"Cancelar":c(B,{children:[c(Ze,{class:"w-4 h-4 mr-1",[n]:{class:n}},3,"X1_3"),e("span",null,null,"Registrar ausencia",3,null)]},1,"X1_4"),1,null)],1,null)],1,null),r.value&&e("div",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow mb-6"},[e("h3",null,{class:"text-lg font-medium mb-4"},"Registrar nueva ausencia",3,null),c(V,{action:t,class:"space-y-4",children:[e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-4"},[e("div",null,null,[e("label",null,{for:"start_date",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de inicio",3,null),e("input",null,{id:"start_date",name:"start_date",type:"date",required:!0,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"end_date",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de fin",3,null),e("input",null,{id:"end_date",name:"end_date",type:"date",required:!0,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},null,3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"absence_type",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Tipo de ausencia",3,null),e("select",null,{id:"absence_type",name:"absence_type",required:!0,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},[e("option",null,{value:""},"Selecciona un tipo",3,null),e("option",null,{value:"illness"},"Baja por enfermedad",3,null),e("option",null,{value:"vacation"},"Vacaciones",3,null),e("option",null,{value:"personal"},"Asuntos personales",3,null),e("option",null,{value:"other"},"Otros",3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"description",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Descripción (opcional)",3,null),e("textarea",null,{id:"description",name:"description",rows:3,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},null,3,null)],3,null),e("div",null,{class:"flex justify-end"},e("button",null,{type:"submit",class:"inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"},[c(fn,{class:"w-4 h-4 mr-2",[n]:{class:n}},3,"X1_5"),"Guardar"],1,null),1,null)],[n]:{action:n,class:n}},1,"X1_6")],1,"X1_7"),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow"},[e("div",null,{class:"grid grid-cols-7 gap-px border-b dark:border-gray-700"},["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(h=>e("div",null,{class:"py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"},h,1,h)),1,null),e("div",null,{class:"grid grid-cols-7 gap-px"},i.value.map((h,w)=>{const M=h.getMonth()===o.value,j=h.toDateString()===new Date().toDateString();return y(h),_(h),e("div",{class:`
                  h-20 p-2 relative
                  ${M?"bg-white dark:bg-gray-800":"bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}
                  ${j?"border-2 border-red-500":""}
                `},null,[e("span",{class:`
                  inline-flex w-6 h-6 items-center justify-center rounded-full text-sm
                  ${j?"bg-red-500 text-white":""}
                `},null,h.getDate(),1,null),y(h)&&e("div",null,{class:"mt-1"},(()=>{const f=_(h);return e("div",{class:`text-xs p-1 rounded-sm truncate ${S(f||"")}`,title:f||""},null,[f==="illness"&&"Enfermedad",f==="vacation"&&"Vacaciones",f==="personal"&&"Personal",f==="other"&&"Otros"],1,"X1_8")})(),1,`absence-${w}`)],1,w)}),1,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-6"},[e("h3",null,{class:"text-lg font-medium mb-4"},"Ausencias registradas",3,null),l.value.absences.length===0?e("p",null,{class:"text-gray-500 dark:text-gray-400 text-center py-4"},"No hay ausencias registradas.",3,"X1_9"):e("div",null,{class:"overflow-x-auto"},e("table",null,{class:"min-w-full divide-y divide-gray-200 dark:divide-gray-700"},[e("thead",null,{class:"bg-gray-50 dark:bg-gray-700"},e("tr",null,null,[e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Tipo",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Fecha inicio",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Fecha fin",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Descripción",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Acciones",3,null)],3,null),3,null),e("tbody",null,{class:"bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"},l.value.absences.map(h=>e("tr",null,null,[e("td",null,{class:"px-6 py-4 whitespace-nowrap"},e("span",{class:`px-2 py-1 text-xs rounded-full ${S(h.absence_type)}`},null,[h.absence_type==="illness"&&"Enfermedad",h.absence_type==="vacation"&&"Vacaciones",h.absence_type==="personal"&&"Personal",h.absence_type==="other"&&"Otros"],1,null),1,null),e("td",null,{class:"px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"},new Date(h.start_date).toLocaleDateString(),1,null),e("td",null,{class:"px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"},new Date(h.end_date).toLocaleDateString(),1,null),e("td",null,{class:"px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate"},h.description||"-",1,null),e("td",null,{class:"px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"},c(V,{action:a,children:[e("input",{value:O(h,"id")},{type:"hidden",name:"absence_id"},null,3,null),e("button",null,{type:"submit",class:"text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300","aria-label":"Eliminar ausencia"},c(Un,{class:"w-5 h-5",[n]:{class:n}},3,"X1_10"),1,null)],[n]:{action:n}},1,"X1_11"),1,null)],1,h.id)),1,null)],1,null),1,null)],1,null)],1,"X1_12")},$r=N(g(Ur,"s_ABXHT4evbVI")),zr=Object.freeze(Object.defineProperty({__proto__:null,default:$r,useDeleteAbsence:Kl,useRegisterAbsence:Wl,useUserAbsences:Gl},Symbol.toStringTag,{value:"Module"}));async function Fr(l){console.log("[DB-INIT] Starting database initialization");const t=P(l);try{console.log("[DB-INIT] Using hardcoded auth schema");const r=`
      -- Users Table for Authentication
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          type TEXT DEFAULT 'trabajador' CHECK (type IN ('trabajador', 'despacho', 'sindicato')),
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
      
      -- Contract Details Table
      CREATE TABLE IF NOT EXISTS contract_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          community TEXT NOT NULL, -- Comunidad
          province TEXT NOT NULL, -- Provincia
          profession TEXT NOT NULL, -- Profesión
          contract_start_date DATE NOT NULL, -- Fecha de inicio del contrato
          contract_end_date DATE, -- Fecha de finalización del contrato (puede ser NULL para contratos indefinidos)
          contract_type TEXT NOT NULL, -- Tipo de contrato (Indefinido, Temporal, etc.)
          probation_period TEXT NOT NULL, -- Periodo de prueba (Sí, No)
          work_schedule_type TEXT NOT NULL, -- Tipo de jornada (Completa, Parcial, etc.)
          weekly_hours INTEGER, -- Horas semanales
          net_salary DECIMAL(10, 2), -- Salario Neto
          gross_salary DECIMAL(10, 2), -- Salario Bruto
          extra_payments TEXT, -- Pagas Extras
          sector TEXT, -- Sector / Sindicato
          contribution_group TEXT, -- Grupo de Cotización
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create index for better performance
      CREATE INDEX IF NOT EXISTS idx_contract_details_user_id ON contract_details(user_id);

      -- User Absences Table (Registro de ausencias laborales)
      CREATE TABLE IF NOT EXISTS user_absences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          absence_type TEXT NOT NULL CHECK (absence_type IN ('illness', 'vacation', 'personal', 'other')),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_absences_user_id ON user_absences(user_id);
      CREATE INDEX IF NOT EXISTS idx_absences_date_range ON user_absences(start_date, end_date);

      -- User Timesheet Table for Check-in/Check-out Records
      CREATE TABLE IF NOT EXISTS user_timesheet (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          check_in_time TIMESTAMP NOT NULL,
          check_out_time TIMESTAMP,
          check_in_location TEXT, -- JSON string with latitude and longitude for check-in
          check_out_location TEXT, -- JSON string with latitude and longitude for check-out
          total_minutes INTEGER, -- Will be calculated upon check-out
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_timesheet_user_id ON user_timesheet(user_id);
      CREATE INDEX IF NOT EXISTS idx_timesheet_date ON user_timesheet(check_in_time);

      -- Tabla para los cursos de capacitación
      CREATE TABLE IF NOT EXISTS cursos_capacitacion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          descripcion TEXT NOT NULL,
          descripcion_completa TEXT,
          categoria TEXT CHECK (categoria IN ('seguridad', 'derechos', 'prevencion', 'igualdad', 'salud')),
          instructor TEXT,
          duracion TEXT,
          imagen_color TEXT DEFAULT 'bg-red-100 dark:bg-red-900/20',
          creado_por INTEGER NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Tabla para los módulos de los cursos
      CREATE TABLE IF NOT EXISTS modulos_curso (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          curso_id INTEGER NOT NULL,
          titulo TEXT NOT NULL,
          tipo TEXT CHECK (tipo IN ('video', 'document', 'quiz', 'interactive')),
          orden INTEGER NOT NULL,
          url_contenido TEXT,
          FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id) ON DELETE CASCADE
      );

      -- Tabla para los recursos descargables de los cursos
      CREATE TABLE IF NOT EXISTS recursos_curso (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          curso_id INTEGER NOT NULL,
          titulo TEXT NOT NULL,
          tipo TEXT CHECK (tipo IN ('pdf', 'excel', 'image', 'document', 'video')),
          url_recurso TEXT,
          FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id) ON DELETE CASCADE
      );

      -- Tabla para el progreso de los usuarios en los cursos
      CREATE TABLE IF NOT EXISTS progreso_curso (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          modulo_id INTEGER NOT NULL,
          completado BOOLEAN DEFAULT FALSE,
          fecha_completado TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (modulo_id) REFERENCES modulos_curso(id) ON DELETE CASCADE,
          UNIQUE(usuario_id, modulo_id)
      );

      -- Índices para mejorar el rendimiento
      CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON cursos_capacitacion(categoria);
      CREATE INDEX IF NOT EXISTS idx_cursos_creador ON cursos_capacitacion(creado_por);
      CREATE INDEX IF NOT EXISTS idx_modulos_curso ON modulos_curso(curso_id);
      CREATE INDEX IF NOT EXISTS idx_recursos_curso ON recursos_curso(curso_id);
      CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_curso(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_progreso_modulo ON progreso_curso(modulo_id);
    `.split(";").map(i=>i.trim()).filter(i=>i.length>0);console.log(`[DB-INIT] Executing ${r.length} SQL statements`);for(const i of r)await t.execute(i);return(await t.batch(["SELECT name FROM sqlite_master WHERE type='table' AND name='users'","SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'","SELECT name FROM sqlite_master WHERE type='table' AND name='user_absences'","SELECT name FROM sqlite_master WHERE type='table' AND name='user_timesheet'","SELECT name FROM sqlite_master WHERE type='table' AND name='cursos_capacitacion'","SELECT name FROM sqlite_master WHERE type='table' AND name='modulos_curso'","SELECT name FROM sqlite_master WHERE type='table' AND name='recursos_curso'","SELECT name FROM sqlite_master WHERE type='table' AND name='progreso_curso'"],"read")).every(i=>i.rows.length>0)?(console.log("[DB-INIT] Database initialized successfully"),{success:!0,message:"Authentication database initialized successfully"}):(console.error("[DB-INIT] Verification failed: one or more required tables not found."),{success:!1,message:"One or more required tables were not created successfully"})}catch(a){return console.error("[DB-INIT] Error initializing database:",a),{success:!1,message:`Database initialization failed: ${a instanceof Error?a.message:String(a)}`}}}async function Br(l){console.log("[DB-CHECK] Checking database connection");const t=P(l);try{const a=await t.execute("SELECT 1 as test");return a.rows&&a.rows.length>0?(console.log("[DB-CHECK] Database connection successful"),{connected:!0,message:"Database connection successful"}):(console.error("[DB-CHECK] Database connection failed: No rows returned"),{connected:!1,message:"Database connection test failed: No rows returned"})}catch(a){return console.error("[DB-CHECK] Database connection error:",a),{connected:!1,message:`Database connection failed: ${a instanceof Error?a.message:String(a)}`}}}const Hr=async(l,t)=>{try{return console.log("[LOGOUT] Starting logout process"),We(t),t.redirect(302,"/auth"),{success:!0}}catch(a){return console.error("Logout error:",a),{success:!1,error:a instanceof Error?a.message:"Logout failed"}}},qr=Y(g(Hr,"s_iyKbdfOHuOI")),Vr=async(l,t)=>{const a=P(t),{email:r}=l;try{return{success:!0,isRegistered:(await a.execute({sql:"SELECT id FROM users WHERE email = ?",args:[r]})).rows.length>0}}catch(o){return console.error("Email check error:",o),{success:!1,error:o instanceof Error?o.message:"Failed to check email"}}},Ql=Y(g(Vr,"s_Emz3Bmx8A2s")),Yr=async(l,t)=>{const a=P(t),{email:r,password:o,fullName:s,userType:i}=l;try{const u=await bl(o);let p;const b=i,m=s?"INSERT INTO users (email, password_hash, type, name) VALUES (?, ?, ?, ?)":"INSERT INTO users (email, password_hash, type) VALUES (?, ?, ?)",x=s?[r,u,b,s.trim()]:[r,u,b];if(p=(await a.execute({sql:m,args:x})).lastInsertRowid,!p)throw new Error("Registration failed: userId is undefined");const _=String(p);return Ge(t,_,b),t.redirect(302,"/chat"),{success:!0}}catch(u){return console.error("Registration error:",u),{success:!1,error:u instanceof Error?u.message:"Registration failed"}}},Zl=Y(g(Yr,"s_dp10BsJQTcg")),Xr=async(l,t)=>{const a=P(t),{email:r,password:o}=l;try{const i=(await a.execute({sql:"SELECT * FROM users WHERE email = ?",args:[r]})).rows[0];if(!i||typeof i.password_hash!="string"||!i.id)return{success:!1,error:"Invalid user data"};if(!await hl(o,i.password_hash))return{success:!1,error:"Invalid password"};const p=String(i.id);await a.execute({sql:"UPDATE users SET session_expires = ? WHERE id = ?",args:[new Date(Date.now()+864e5),p]});const b=i.type;return Ge(t,p,b),t.redirect(302,"/chat"),{success:!0}}catch(s){return console.error("Login error:",s),{success:!1,error:"Login failed"}}},Jl=Y(g(Xr,"s_R0sJTR90Tks")),Gr=async l=>{console.log("[AUTH-SETUP] Starting database setup");try{const t=await Br(l);if(!t.connected)return console.error("[AUTH-SETUP] Database connection failed:",t.message),{success:!1,error:"Database connection failed. Check your environment configuration.",details:t.message};const a=await Fr(l);if(!a.success)return console.error("[AUTH-SETUP] Database initialization failed:",a.message),{success:!1,error:"Failed to initialize authentication database.",details:a.message};const r=X(l);return console.log(`[AUTH-SETUP] Current user ID: ${r||"none"}`),console.log("[AUTH-SETUP] Database setup completed successfully"),{success:!0,message:"Database initialized successfully",user_id:r}}catch(t){return console.error("[AUTH-SETUP] Unexpected error during setup:",t),{success:!1,error:"An unexpected error occurred during setup",details:t instanceof Error?t.message:String(t)}}},et=H(g(Gr,"s_wERsQ0wluBY")),Wr=()=>{var s,i;const[l,t,a,r,o]=A();(s=l.value)!=null&&s.success?(o.value=l.value.isRegistered?"password":"register",t.value=document.getElementById("email").value):a.value=((i=l.value)==null?void 0:i.error)||"Failed to check email",r.value=!1},Kr=()=>{var r,o;const[l,t,a]=A();(r=a.value)!=null&&r.success||(l.value=((o=a.value)==null?void 0:o.error)||"Login failed"),t.value=!1},Qr=()=>{const[l,t,a]=A(),r=a.value;r&&typeof r=="object"&&"success"in r&&!r.success&&(l.value=r&&"error"in r&&r.error?String(r.error):"Registration failed"),t.value=!1},Zr=()=>{var m,x,y;G();const l=et(),t=Ql(),a=Zl(),r=Jl(),o=E("email"),s=E(""),i=E(""),u=E(""),p=E(!1),b=E(null);return(m=l.value)!=null&&m.success?(console.log("Tables initialized successfully"),b.value="Database ready"):(x=l.value)!=null&&x.error&&(console.error("Database setup error:",l.value.error),b.value=`Database Error: ${l.value.error}`,u.value=l.value.error),e("div",null,{class:"min-h-screen w-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative"},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden z-0"},[e("div",null,{class:"w-3 h-3 bg-red-400/50 dark:bg-red-300/40 rounded-full absolute top-[20%] left-[35%] animate-[pulse_4s_infinite]"},null,3,null),e("div",null,{class:"w-2 h-2 bg-red-400/50 dark:bg-red-300/40 rounded-full absolute top-[60%] left-[70%] animate-[pulse_5s_infinite]",style:"animation-delay: 0.7s;"},null,3,null)],3,null),e("div",null,{class:"absolute top-6 left-1/2 transform -translate-x-1/2"},e("div",null,{class:"flex items-center"},[e("div",null,{class:"relative"},e("div",null,{class:"w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg"},c(Le,{class:"w-6 h-6",[n]:{class:n}},3,"lQ_0"),1,null),1,null),e("div",null,{class:"ml-2 flex flex-col"},[e("h1",null,{class:"text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"DAI Off",3,null),e("span",null,{class:"text-xs text-red-700 dark:text-red-400"},"Tu Defensor Laboral Digital",3,null)],3,null)],1,null),1,null),e("div",null,{class:"max-w-md w-full z-10"},[e("div",null,{class:"bg-white dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]"},[e("div",null,{class:"text-center mb-8"},[e("h2",null,{class:"text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},d(_=>_.value==="email"?"Bienvenido de vuelta!":_.value==="password"?"Iniciar Sesión":"Únete a DAI Off",[o],'p0.value==="email"?"Bienvenido de vuelta!":p0.value==="password"?"Iniciar Sesión":"Únete a DAI Off"'),3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},d((_,S)=>S.value==="email"?"Enter your email to continue":S.value==="password"?`Signing in as ${_.value}`:`Complete registration for ${_.value}`,[s,o],'p1.value==="email"?"Enter your email to continue":p1.value==="password"?`Signing in as ${p0.value}`:`Complete registration for ${p0.value}`'),3,null)],3,null),o.value==="email"&&c(V,{action:t,class:"space-y-6",onSubmit$:g(Wr,"s_0W0s83zLYU4",[t,s,u,p,o]),children:[e("div",null,{class:"space-y-2"},[e("label",null,{for:"email",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Email Address",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},c(Sn,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_1"),1,null),e("input",null,{id:"email",name:"email",type:"email",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"you@example.com"},null,3,null)],1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"We'll check if you already have an account",3,null)],1,null),e("button",null,{type:"submit",disabled:d(_=>_.value,[p],"p0.value"),class:"w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:k("s_nhTrYlK9e5w",[u,p])},p.value?e("span",null,{class:"flex items-center"},[c(he,{class:"animate-spin mr-2 h-5 w-5 text-white",[n]:{class:n}},3,"lQ_2"),"Checking..."],1,"lQ_3"):"Continue",1,null)],[n]:{action:n,class:n,onSubmit$:n}},1,"lQ_4"),o.value==="password"&&c(V,{action:r,class:"space-y-6",onSubmit$:g(Kr,"s_XMeAkUxhnZI",[u,p,r]),children:[e("input",null,{type:"hidden",name:"email",value:d(_=>_.value,[s],"p0.value")},null,3,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"password",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Password",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},c(nl,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_5"),1,null),e("input",null,{id:"password",name:"password",type:"password",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"••••••••"},null,3,null)],1,null),e("div",null,{class:"flex justify-end"},e("a",null,{href:"#",class:"text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"},"Forgot password?",3,null),3,null)],1,null),e("div",null,{class:"flex justify-between items-center"},[e("button",null,{type:"button",class:"flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm",onClick$:k("s_Hkz91dGcq04",[u,i,o])},[c(se,{class:"mr-2 h-4 w-4",[n]:{class:n}},3,"lQ_6"),"Back"],1,null),e("button",null,{type:"submit",disabled:d(_=>_.value,[p],"p0.value"),class:"flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:k("s_iXE2aeUX0tQ",[u,p])},p.value?e("span",null,{class:"flex items-center"},[c(he,{class:"animate-spin mr-2 h-5 w-5 text-white",[n]:{class:n}},3,"lQ_7"),"Signing in..."],1,"lQ_8"):"Sign In",1,null)],1,null)],[n]:{action:n,class:n,onSubmit$:n}},1,"lQ_9"),o.value==="register"&&c(V,{action:a,class:"space-y-6",onSubmit$:g(Qr,"s_BNuG0tWAYzo",[u,p,a]),children:[e("input",null,{type:"hidden",name:"email",value:d(_=>_.value,[s],"p0.value")},null,3,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"password",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Create Password",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},c(nl,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_10"),1,null),e("input",null,{id:"password",name:"password",type:"password",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"Choose a strong password",minLength:6},null,3,null)],1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"Password must be at least 6 characters",3,null)],1,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"fullName",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Full Name (Optional)",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},c(Le,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[n]:{class:n}},3,"lQ_11"),1,null),e("input",null,{id:"fullName",name:"fullName",type:"text",class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"Your Name"},null,3,null)],1,null)],1,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"userType",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Tipo de Usuario",3,null),e("div",null,{class:"relative"},e("select",null,{id:"userType",name:"userType",required:!0,class:"block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700"},[e("option",null,{value:"",disabled:!0,selected:!0},"Selecciona un tipo",3,null),e("option",null,{value:"trabajador"},"Trabajador",3,null),e("option",null,{value:"despacho"},"Despacho",3,null),e("option",null,{value:"sindicato"},"Sindicato",3,null)],3,null),3,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"Selecciona el tipo de usuario que mejor te describe",3,null)],3,null),e("div",null,{class:"flex justify-between items-center"},[e("button",null,{type:"button",class:"flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm",onClick$:k("s_ivZv3s0Fr3k",[u,i,o])},[c(se,{class:"mr-2 h-4 w-4",[n]:{class:n}},3,"lQ_12"),"Back"],1,null),e("button",null,{type:"submit",disabled:d(_=>_.value,[p],"p0.value"),class:"flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:k("s_857oCKNI0eQ",[u,p])},p.value?e("span",null,{class:"flex items-center"},[c(he,{class:"animate-spin mr-2 h-5 w-5 text-white",[n]:{class:n}},3,"lQ_13"),"Creating account..."],1,"lQ_14"):"Create Account",1,null)],1,null)],[n]:{action:n,class:n,onSubmit$:n}},1,"lQ_15"),u.value&&e("div",null,{class:"mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-[slide-up_0.3s_ease-out]"},e("div",null,{class:"flex items-start"},[c(vl,{class:"h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0",[n]:{class:n}},3,"lQ_16"),e("div",null,null,[e("p",null,{class:"text-sm text-red-600 dark:text-red-300 font-semibold"},d(_=>_.value,[u],"p0.value"),3,null),((y=l.value)==null?void 0:y.details)&&e("p",null,{class:"text-xs text-red-500 dark:text-red-300 mt-1"},["Details: ",d(_=>_.value.details,[l],"p0.value.details")],3,"lQ_17")],1,null)],1,null),1,"lQ_18"),!1],1,null),e("div",null,{class:"mt-6 text-center text-sm text-gray-600 dark:text-gray-400"},["Al continuar, aceptas los",e("a",null,{href:"/terms",class:"text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 ml-1"},"Términos de Servicio",3,null),e("span",null,{class:"mx-1"},"y",3,null),e("a",null,{href:"/privacy",class:"text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"},"Política de Privacidad",3,null),"de DAI Off"],3,null)],1,null),e("style",null,null,`
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
      `,3,null)],1,"lQ_21")},Jr=N(g(Zr,"s_Rhbq243Q8qQ")),eo=Object.freeze(Object.defineProperty({__proto__:null,default:Jr,useCheckEmail:Ql,useLogin:Jl,useLogout:qr,useRegister:Zl,useTableSetup:et},Symbol.toStringTag,{value:"Module"})),lo=`.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile::-moz-selection{background:transparent}.leaflet-tile::selection{background:transparent}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-overlay-pane svg{max-width:none!important;max-height:none!important}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none!important;max-height:none!important;width:auto;padding:0}.leaflet-container img.leaflet-tile{mix-blend-mode:plus-lighter}.leaflet-container.leaflet-touch-zoom{touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{touch-action:none}.leaflet-container{-webkit-tap-highlight-color:transparent}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,.4)}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;box-sizing:border-box;z-index:800}.leaflet-overlay-pane svg{-moz-user-select:none}.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-vml-shape{width:1px;height:1px}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-fade-anim .leaflet-popup{opacity:0;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}.leaflet-zoom-animated{transform-origin:0 0}svg.leaflet-zoom-animated{will-change:transform}.leaflet-zoom-anim .leaflet-zoom-animated{transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{transition:none}.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-popup-pane,.leaflet-control{cursor:auto}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:grabbing}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane>svg path,.leaflet-tile-container{pointer-events:none}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container{background:#ddd;outline-offset:1px}.leaflet-container a{color:#0078a8}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,.5)}.leaflet-container{font-family:Helvetica Neue,Arial,Helvetica,sans-serif;font-size:12px;font-size:.75rem;line-height:1.5}.leaflet-bar{box-shadow:0 1px 5px #000000a6;border-radius:4px}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:700 18px Lucida Console,Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px}.leaflet-control-layers{box-shadow:0 1px 5px #0006;background:#fff;border-radius:5px}.leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAQAAAADQ4RFAAACf0lEQVR4AY1UM3gkARTePdvdoTxXKc+qTl3aU5U6b2Kbkz3Gtq3Zw6ziLGNPzrYx7946Tr6/ee/XeCQ4D3ykPtL5tHno4n0d/h3+xfuWHGLX81cn7r0iTNzjr7LrlxCqPtkbTQEHeqOrTy4Yyt3VCi/IOB0v7rVC7q45Q3Gr5K6jt+3Gl5nCoDD4MtO+j96Wu8atmhGqcNGHObuf8OM/x3AMx38+4Z2sPqzCxRFK2aF2e5Jol56XTLyggAMTL56XOMoS1W4pOyjUcGGQdZxU6qRh7B9Zp+PfpOFlqt0zyDZckPi1ttmIp03jX8gyJ8a/PG2yutpS/Vol7peZIbZcKBAEEheEIAgFbDkz5H6Zrkm2hVWGiXKiF4Ycw0RWKdtC16Q7qe3X4iOMxruonzegJzWaXFrU9utOSsLUmrc0YjeWYjCW4PDMADElpJSSQ0vQvA1Tm6/JlKnqFs1EGyZiFCqnRZTEJJJiKRYzVYzJck2Rm6P4iH+cmSY0YzimYa8l0EtTODFWhcMIMVqdsI2uiTvKmTisIDHJ3od5GILVhBCarCfVRmo4uTjkhrhzkiBV7SsaqS+TzrzM1qpGGUFt28pIySQHR6h7F6KSwGWm97ay+Z+ZqMcEjEWebE7wxCSQwpkhJqoZA5ivCdZDjJepuJ9IQjGGUmuXJdBFUygxVqVsxFsLMbDe8ZbDYVCGKxs+W080max1hFCarCfV+C1KATwcnvE9gRRuMP2prdbWGowm1KB1y+zwMMENkM755cJ2yPDtqhTI6ED1M/82yIDtC/4j4BijjeObflpO9I9MwXTCsSX8jWAFeHr05WoLTJ5G8IQVS/7vwR6ohirYM7f6HzYpogfS3R2OAAAAAElFTkSuQmCC);width:36px;height:36px}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAQAAABvcdNgAAAEsklEQVR4AWL4TydIhpZK1kpWOlg0w3ZXP6D2soBtG42jeI6ZmQTHzAxiTbSJsYLjO9HhP+WOmcuhciVnmHVQcJnp7DFvScowZorad/+V/fVzMdMT2g9Cv9guXGv/7pYOrXh2U+RRR3dSd9JRx6bIFc/ekqHI29JC6pJ5ZEh1yWkhkbcFeSjxgx3L2m1cb1C7bceyxA+CNjT/Ifff+/kDk2u/w/33/IeCMOSaWZ4glosqT3DNnNZQ7Cs58/3Ce5HL78iZH/vKVIaYlqzfdLu8Vi7dnvUbEza5Idt36tquZFldl6N5Z/POLof0XLK61mZCmJSWjVF9tEjUluu74IUXvgttuVIHE7YxSkaYhJZam7yiM9Pv82JYfl9nptxZaxMJE4YSPty+vF0+Y2up9d3wwijfjZbabqm/3bZ9ecKHsiGmRflnn1MW4pjHf9oLufyn2z3y1D6n8g8TZhxyzipLNPnAUpsOiuWimg52psrTZYnOWYNDTMuWBWa0tJb4rgq1UvmutpaYEbZlwU3CLJm/ayYjHW5/h7xWLn9Hh1vepDkyf7dE7MtT5LR4e7yYpHrkhOUpEfssBLq2pPhAqoSWKUkk7EDqkmK6RrCEzqDjhNDWNE+XSMvkJRDWlZTmCW0l0PHQGRZY5t1L83kT0Y3l2SItk5JAWHl2dCOBm+fPu3fo5/3v61RMCO9Jx2EEYYhb0rmNQMX/vm7gqOEJLcXTGw3CAuRNeyaPWwjR8PRqKQ1PDA/dpv+on9Shox52WFnx0KY8onHayrJzm87i5h9xGw/tfkev0jGsQizqezUKjk12hBMKJ4kbCqGPVNXudyyrShovGw5CgxsRICxF6aRmSjlBnHRzg7Gx8fKqEubI2rahQYdR1YgDIRQO7JvQyD52hoIQx0mxa0ODtW2Iozn1le2iIRdzwWewedyZzewidueOGqlsn1MvcnQpuVwLGG3/IR1hIKxCjelIDZ8ldqWz25jWAsnldEnK0Zxro19TGVb2ffIZEsIO89EIEDvKMPrzmBOQcKQ+rroye6NgRRxqR4U8EAkz0CL6uSGOm6KQCdWjvjRiSP1BPalCRS5iQYiEIvxuBMJEWgzSoHADcVMuN7IuqqTeyUPq22qFimFtxDyBBJEwNyt6TM88blFHao/6tWWhuuOM4SAK4EI4QmFHA+SEyWlp4EQoJ13cYGzMu7yszEIBOm2rVmHUNqwAIQabISNMRstmdhNWcFLsSm+0tjJH1MdRxO5Nx0WDMhCtgD6OKgZeljJqJKc9po8juskR9XN0Y1lZ3mWjLR9JCO1jRDMd0fpYC2VnvjBSEFg7wBENc0R9HFlb0xvF1+TBEpF68d+DHR6IOWVv2BECtxo46hOFUBd/APU57WIoEwJhIi2CdpyZX0m93BZicktMj1AS9dClteUFAUNUIEygRZCtik5zSxI9MubTBH1GOiHsiLJ3OCoSZkILa9PxiN0EbvhsAo8tdAf9Seepd36lGWHmtNANTv5Jd0z4QYyeo/UEJqxKRpg5LZx6btLPsOaEmdMyxYdlc8LMaJnikDlhclqmPiQnTEpLUIZEwkRagjYkEibQErwhkTAKCLQEbUgkzJQWc/0PstHHcfEdQ+UAAAAASUVORK5CYII=);background-size:26px 26px}.leaflet-touch .leaflet-control-layers-toggle{width:44px;height:44px}.leaflet-control-layers .leaflet-control-layers-list,.leaflet-control-layers-expanded .leaflet-control-layers-toggle{display:none}.leaflet-control-layers-expanded .leaflet-control-layers-list{display:block;position:relative}.leaflet-control-layers-expanded{padding:6px 10px 6px 6px;color:#333;background:#fff}.leaflet-control-layers-scrollbar{overflow-y:scroll;overflow-x:hidden;padding-right:5px}.leaflet-control-layers-selector{margin-top:2px;position:relative;top:1px}.leaflet-control-layers label{display:block;font-size:13px;font-size:1.08333em}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px 5px -6px}.leaflet-default-icon-path{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=)}.leaflet-container .leaflet-control-attribution{background:#fff;background:rgba(255,255,255,.8);margin:0}.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333;line-height:1.4}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover,.leaflet-control-attribution a:focus{text-decoration:underline}.leaflet-attribution-flag{display:inline!important;vertical-align:baseline!important;width:1em;height:.6669em}.leaflet-left .leaflet-control-scale{margin-left:5px}.leaflet-bottom .leaflet-control-scale{margin-bottom:5px}.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;white-space:nowrap;box-sizing:border-box;background:rgba(255,255,255,.8);text-shadow:1px 1px #fff}.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px}.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777}.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{box-shadow:none}.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px}.leaflet-popup-content{margin:13px 24px 13px 20px;line-height:1.3;font-size:13px;font-size:1.08333em;min-height:1px}.leaflet-popup-content p{margin:1.3em 0}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-top:-1px;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;pointer-events:auto;transform:rotate(45deg)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:white;color:#333;box-shadow:0 3px 14px #0006}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;border:none;text-align:center;width:24px;height:24px;font:16px/24px Tahoma,Verdana,sans-serif;color:#757575;text-decoration:none;background:transparent}.leaflet-container a.leaflet-popup-close-button:hover,.leaflet-container a.leaflet-popup-close-button:focus{color:#585858}.leaflet-popup-scrolled{overflow:auto}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}.leaflet-oldie .leaflet-popup-tip{width:24px;margin:0 auto;-ms-filter:"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)";filter:progid:DXImageTransform.Microsoft.Matrix(M11=.70710678,M12=.70710678,M21=-.70710678,M22=.70710678)}.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999}.leaflet-div-icon{background:#fff;border:1px solid #666}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px #0006}.leaflet-tooltip.leaflet-interactive{cursor:pointer;pointer-events:auto}.leaflet-tooltip-top:before,.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}.leaflet-tooltip-bottom{margin-top:6px}.leaflet-tooltip-top{margin-top:-6px}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}.leaflet-tooltip-left{margin-left:-6px}.leaflet-tooltip-right{margin-left:6px}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}@media print{.leaflet-control{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`,to=lo+`
      .marker-label {
        color: red;
        font-weight: 700;
      }
      .custom-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #ef4444;
        color: white;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    `,no=l=>{qt(g(to,"s_ersnw0c2HOY"));const t=E();return U(k("s_E0NWQbbPBzs",[t,l])),e("div",null,{id:"map",style:{height:"25rem",width:"100%",borderRadius:"0.5rem"}},null,3,"Za_0")},lt=N(g(no,"s_8dKzP2mTye4")),ao=l=>{const t=E({name:l.name??"Tu ubicación",point:[l.latitude,l.longitude],zoom:15,marker:!0});return c(lt,{location:t,[n]:{location:n}},3,"Za_1")},ro=N(g(ao,"s_RVsF00ZXFwI")),tt=[{name:"Oficina Central",label:"HQ",lat:"45.770946",lon:"13.31338"},{name:"Sucursal Norte",label:"N",lat:"46.312663",lon:"13.274682"},{name:"Sucursal Sur",label:"S",lat:"45.610495",lon:"13.752682"}],oo=()=>{const l=E({name:"Ubicación Actual",point:[45.943512,13.482948],zoom:9,marker:!0}),t=E("all");return e("div",null,{class:"px-4 py-6"},[e("div",null,{class:"mb-6"},[e("h1",null,{class:"text-2xl font-bold text-gray-800 dark:text-white mb-4"},"Demo de LeafletJS Map",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-4"},"Ejemplo de implementación del mapa para la aplicación.",3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"},[e("h2",null,{class:"text-xl font-semibold mb-4"},"Mapa Interactivo",3,null),c(lt,{location:l,get markers(){return tt},group:t,[n]:{location:n,markers:n,group:n}},3,"ei_0")],1,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-4"},[e("h3",null,{class:"font-medium mb-2"},"Instrucciones de Uso",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-sm"},[e("li",null,null,["Utiliza el componente ",e("code",null,null,"LeafletMap",3,null)," para mostrar ubicaciones"],3,null),e("li",null,null,["Configura el zoom y centro del mapa con ",e("code",null,null,"location",3,null)],3,null),e("li",null,null,["Añade marcadores con el array ",e("code",null,null,"markers",3,null)],3,null),e("li",null,null,"Los marcadores pueden ser filtrados con grupos",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-4"},[e("h3",null,{class:"font-medium mb-2"},"En la aplicación de Timesheet",3,null),e("p",null,{class:"text-sm"},"Este mapa se utiliza para mostrar las ubicaciones de fichaje de los empleados. Reemplaza el iframe de Google Maps con un mapa interactivo de LeafletJS que es más ligero y no requiere API key.",3,null)],3,null)],3,null)],1,"ei_1")},so=N(g(oo,"s_q0SrePkbHM4")),io=Object.freeze(Object.defineProperty({__proto__:null,_auto_markers:tt,default:so},Symbol.toStringTag,{value:"Module"})),co=async l=>{try{return(await P(l).execute(`
      SELECT id, titulo, descripcion, categoria, instructor, duracion, imagen_color
      FROM cursos_capacitacion
      ORDER BY fecha_creacion DESC
    `)).rows.map(r=>({id:Number(r.id),titulo:String(r.titulo),descripcion:String(r.descripcion),categoria:String(r.categoria),imagen_color:String(r.imagen_color||"bg-red-100 dark:bg-red-900/20"),instructor:r.instructor?String(r.instructor):void 0,duracion:r.duracion?String(r.duracion):void 0}))}catch(t){return console.error("[CAPACITACION] Error al cargar cursos:",t),[]}},nt=H(g(co,"s_Cp7y9bSUCUc")),uo=()=>{const[l,t,a,r]=A();let o=t.value;if(a.value!=="todas"&&(o=o.filter(s=>s.categoria===a.value)),r.value.trim()!==""){const s=r.value.toLowerCase();o=o.filter(i=>i.titulo.toLowerCase().includes(s)||i.descripcion.toLowerCase().includes(s))}l.value=o},go=()=>{const l=nt(),t=E(l.value),a=E("todas"),r=E(""),o=[{id:"todas",nombre:"Todas las categorías"},{id:"seguridad",nombre:"Seguridad y Salud"},{id:"derechos",nombre:"Derechos Laborales"},{id:"prevencion",nombre:"Prevención de Acoso"},{id:"igualdad",nombre:"Igualdad y No Discriminación"},{id:"salud",nombre:"Salud Mental"}];return U(k("s_3VgM0DycfIM",[g(uo,"s_giDtzlbH0jg",[t,l,a,r]),a,r])),e("div",null,{class:"capacitacion-container"},[e("header",null,{class:"mb-8"},[e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Capacitaciones laborales",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-6"},"Aquí es donde puedes mantenerte al tanto de leyes laborales y defender tus derechos como trabajador",3,null),e("div",null,{class:"flex justify-end mb-4"},c(I,{href:"/capacitacion/crear",class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors",children:[c(_n,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"0u_0"),"Crear nuevo curso"],[n]:{href:n,class:n}},1,"0u_1"),1,null),e("div",null,{class:"flex flex-col md:flex-row gap-4 mb-6"},[e("div",null,{class:"w-full md:w-1/3"},e("div",null,{class:"relative"},[c(On,{class:"absolute top-2 left-3 w-5 h-5 text-slate-400",[n]:{class:n}},3,"0u_2"),e("input",null,{type:"text",placeholder:"Buscar cursos...",class:"w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",value:r,onInput$:k("s_N2QFIK0HPIY",[r])},null,3,null)],1,null),1,null),e("div",null,{class:"w-full md:w-1/3"},e("div",null,{class:"relative"},[c(Tl,{class:"absolute top-2 left-3 w-5 h-5 text-slate-400",[n]:{class:n}},3,"0u_3"),e("select",null,{class:"w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none",value:a,onInput$:k("s_x0knmnd7rIE",[a])},o.map(i=>e("option",{value:O(i,"id")},null,i.nombre,1,i.id)),1,null)],1,null),1,null)],1,null)],1,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},t.value.length>0?t.value.map(i=>e("div",null,{class:"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"},e("div",null,{class:"p-6"},e("div",null,{class:"flex items-start"},[e("div",{class:`w-24 h-24 min-w-[6rem] flex-shrink-0 mr-5 rounded-lg ${i.imagen_color} flex items-center justify-center relative`},null,e("span",null,{class:"text-4xl  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"},[i.categoria==="seguridad"&&"🛡️",i.categoria==="derechos"&&"⚖️",i.categoria==="prevencion"&&"🚫",i.categoria==="igualdad"&&"🤝",i.categoria==="salud"&&"❤️"],1,null),1,null),e("div",null,{class:"flex-1 pl-4"},[e("h2",null,{class:"text-xl  ml-2 font-bold text-slate-900 dark:text-white mb-2"},O(i,"titulo"),1,null),e("p",null,{class:"text-slate-600  ml-2  dark:text-slate-300 text-sm mb-4"},O(i,"descripcion"),1,null),e("div",null,{class:"flex ml-2  items-center mt-4"},c(I,{href:`/capacitacion/curso/${i.id}`,class:"inline-block bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md transition-colors text-sm font-medium shadow-sm",children:"Iniciar",[n]:{class:n}},3,"0u_4"),1,null)],1,null)],1,null),1,null),1,i.id)):e("div",null,{class:"col-span-full text-center py-8"},e("p",null,{class:"text-slate-600 dark:text-slate-400"},"No se encontraron cursos. ¡Crea uno nuevo!",3,null),3,"0u_5"),1,null)],1,"0u_6")},po=N(g(go,"s_b5C8UnDF0QM")),mo=Object.freeze(Object.defineProperty({__proto__:null,default:po,useCursosLoader:nt},Symbol.toStringTag,{value:"Module"})),Ne=10,ye={}.DID_API_URL||"https://api.d-id.com",Xe=l=>{for(const t of Ce)if(t.value===l)return t.code;return"US"},_e={US:Yt,ES:Xt,IT:Gt,FR:Wt,BR:Kt},Ce=[{value:"en-US",label:"English",code:"US",flagSvg:_e.US},{value:"es-ES",label:"Spanish",code:"ES",flagSvg:_e.ES},{value:"it-IT",label:"Italian",code:"IT",flagSvg:_e.IT},{value:"fr-FR",label:"French",code:"FR",flagSvg:_e.FR},{value:"pt-BR",label:"Portuguese",code:"BR",flagSvg:_e.BR}],oe={"en-US":"English","es-ES":"Spanish","it-IT":"Italian","fr-FR":"French","pt-BR":"Portuguese"},ol={"en-US":{type:"microsoft",voice_id:"en-US-JennyNeural"},"es-ES":{type:"microsoft",voice_id:"es-ES-AbrilNeural"},"it-IT":{type:"microsoft",voice_id:"it-IT-IsabellaNeural"},"fr-FR":{type:"microsoft",voice_id:"fr-FR-DeniseNeural"},"pt-BR":{type:"microsoft",voice_id:"pt-BR-BrendaNeural"}},at=l=>ol[l]||ol["en-US"],rt=l=>{if(!l)return"";let t=l.replace(/\*\*([^*]+)\*\*/g,"$1");return t=t.replace(/\*([^*]+)\*/g,"$1"),t=t.replace(/~~([^~]+)~~/g,"$1"),t=t.replace(/`([^`]+)`/g,"$1"),t=t.replace(/```[a-z]*\n([\s\S]*?)```/g,"code block omitted"),t=t.replace(/^#{1,6}\s+(.+)$/gm,"$1"),t=t.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),t=t.replace(/https?:\/\/\S+/g,"URL"),t=t.replace(/www\.\S+/g,"URL"),t=t.replace(/\n\s*[-•*+]\s*/g,", "),t=t.replace(/\n/g," "),t=t.replace(/[#_~<>{}|]/g,""),t=t.replace(/&[a-z]+;/g," "),t=t.replace(/["']([^"']+)["']/g,"$1"),t=t.replace(/\s+/g," ").trim(),t},bo=K(function(){const l=this.env.get("DID_API_KEY")||{}.DID_API_KEY;return l?`Basic ${l}`:(console.error("D-ID API Key is not configured on the server."),"")},"cZmc7P5UUuA"),we=W(g(bo,"s_cZmc7P5UUuA")),ho=K(async function(l,t,a=0){try{console.log(`Server Fetch: Making request to: ${l}`,{method:t.method});const s=await fetch(l,t);if(!s.ok){const i=await s.text().catch(()=>"No error details");if(console.error(`Server Fetch: Request failed status ${s.status}: ${i}`),s.status===401||s.status===403)throw console.error("Server Fetch: Authentication failed. Check D-ID API key."),new Error(`Authentication failed: ${s.status}`);if(a<3){const u=Math.min(Math.pow(2,a)/4+Math.random(),4)*3e3;return console.log(`Server Fetch: Retrying in ${u}ms...`),await new Promise(p=>setTimeout(p,u)),ie(l,t,a+1)}throw new Error(`Server Fetch: Request failed status: ${s.status}`)}return s}catch(s){if(a<3){const i=Math.min(Math.pow(2,a)/4+Math.random(),4)*3e3;return console.log(`Server Fetch: Request error: ${s.message}, retrying in ${i}ms...`),await new Promise(u=>setTimeout(u,i)),ie(l,t,a+1)}throw console.error("Server Fetch: Max retries exceeded:",s),s}},"ZZpOGQZsXss"),ie=W(g(ho,"s_ZZpOGQZsXss")),fo=K(async function(){console.log("Server: Step 1: Creating a new stream");const l=await we();if(!l)throw new Error("Server Auth Header failed");const a=await(await ie(`${ye}/talks/streams`,{method:"POST",headers:{Authorization:l,"Content-Type":"application/json"},body:JSON.stringify({source_url:"https://i.postimg.cc/fLdQq0DW/thumbnail.jpg"})})).json();if(console.log("Server: Stream creation response:",a),!a.id||!a.session_id)throw new Error("Server: Stream ID or Session ID missing");return{streamId:a.id,offer:a.offer||a.jsep,iceServers:a.ice_servers,sessionId:a.session_id}},"CfpRc90J9U4"),ot=W(g(fo,"s_CfpRc90J9U4")),xo=K(async function(l,t,a){console.log("Server: Step 3: Sending SDP answer");const r=await we();if(!r)throw new Error("Server Auth Header failed");const o=await ie(`${ye}/talks/streams/${l}/sdp`,{method:"POST",headers:{Authorization:r,"Content-Type":"application/json"},body:JSON.stringify({answer:a,session_id:t})});if(!o.ok)throw new Error(`Server: SDP response error: ${o.status}`);return console.log("Server: SDP answer sent successfully"),await o.json()},"3nz0mRTbAs8"),st=W(g(xo,"s_3nz0mRTbAs8")),vo=K(async function(l,t,a){console.log("Server: Sending ICE candidate");const r=await we();if(!r)throw new Error("Server Auth Header failed");const o=await ie(`${ye}/talks/streams/${l}/ice`,{method:"POST",headers:{Authorization:r,"Content-Type":"application/json"},body:JSON.stringify({...a,session_id:t})});o.ok?console.log("Server: ICE candidate sent successfully"):console.error(`Server: Failed to send ICE candidate: ${o.status}`)},"9bTWdD9eHtM"),it=W(g(vo,"s_9bTWdD9eHtM")),yo=K(async function(l,t,a,r){console.log("Server: Step 4: Creating a talk");const o=await we();if(!o)throw new Error("Server Auth Header failed");const s=await ie(`${ye}/talks/streams/${a}`,{method:"POST",headers:{Authorization:o,"Content-Type":"application/json"},body:JSON.stringify({session_id:r,script:{type:"text",input:rt(l),provider:{type:t.type,voice_id:t.voice_id}},config:{stitch:!0},driver_url:"bank://lively"})});if(!s.ok)throw new Error(`Server: Talk request failed status: ${s.status}`);const i=await s.json();return console.log("Server: Talk created successfully:",i),i},"zVEU324USAY"),ct=W(g(yo,"s_zVEU324USAY")),wo=K(async function(l,t){if(!l||!t)return;console.log("Server: Step 5: Closing the stream");const a=await we();if(!a){console.error("Server: Cannot close stream, auth header failed");return}try{await ie(`${ye}/talks/streams/${l}`,{method:"DELETE",headers:{Authorization:a,"Content-Type":"application/json"},body:JSON.stringify({session_id:t})}),console.log("Server: Stream closed successfully")}catch(r){console.error("Server: Error closing stream:",r.message)}},"EshFHZDaKXA"),ut=W(g(wo,"s_EshFHZDaKXA")),dt=(l,t=Ne)=>{if(l.length<=t)return[...l];const a=l.filter(s=>s.role==="system"),o=l.filter(s=>s.role!=="system").slice(-t);return[...a,...o]},ko=K(async function(l,t,a,r=[]){console.log("Server: Fetching LangChain response for thread:",t);const o=this.env.get("OPENAI_API_KEY")||{}.OPENAI_API_KEY;if(!o)return console.error("OpenAI API Key not configured on server."),"Error: AI service not configured.";try{const s=new ul({openAIApiKey:o,model:"gpt-4o-mini",temperature:0}),i=`You are a helpful assistant for DAI OFF, a legal labor advisory service. Answer all questions to the best of your ability about labor rights, legislation, and legal matters in ${a}.`,u=r.some(y=>y.role==="system");let p=[...r];u||p.unshift({role:"system",content:i}),p.push({role:"user",content:l});const m=dt(p).map(y=>y.role==="system"?new dl(y.content):y.role==="user"?new gl(y.content):new pl(y.content));console.log(`Server: Using ${m.length} messages for context`);const x=await s.invoke(m);return console.log("Server: LangChain response:",x.content),x.content}catch(s){return console.error("Server: Error in LangChain model:",s),"I'm sorry, I encountered an error processing your request."}},"dVPtsXiqStU"),gt=W(g(ko,"s_dVPtsXiqStU")),_o=K(async function(l,t,a){console.log("Server: Processing audio with OpenAI STT");const r=this.env.get("OPENAI_API_KEY");if(!r)return console.error("OpenAI API Key not configured on server."),"Error: Speech service not configured.";try{const o=Buffer.from(l,"base64"),s=new FormData,i=new Blob([o],{type:t});s.append("file",i,"audio.webm");let u="";switch(a.toLowerCase()){case"english":u="en";break;case"spanish":u="es";break;case"italian":u="it";break;case"french":u="fr";break;case"portuguese":u="pt";break;default:u="en"}s.append("language",u),console.log(`Server: Audio processing - Using language code '${u}' for '${a}'`),s.append("prompt",`The following is a conversation in ${a}. Please transcribe accurately maintaining the original language.`),s.append("model","whisper-1"),s.append("response_format","text"),console.log("Server: Sending audio data to OpenAI, size:",o.length,"bytes");const p=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:`Bearer ${r}`},body:s});if(!p.ok){const m=await p.text();throw console.error("Server: OpenAI STT API error:",p.status,m),new Error(`OpenAI STT API error: ${p.status}`)}const b=await p.text();return console.log(`Server: Transcription result (${a}):`,b),console.log(`Server: Transcription length: ${b.length} characters`),b.trim()}catch(o){return console.error("Server: Error processing audio with OpenAI:",o),"Error processing audio."}},"Q89AFdX2E0U"),pt=W(g(_o,"s_Q89AFdX2E0U")),Eo=K(async function(l,t,a,r){if(!r){console.warn("Server: Cannot save chat message, user not logged in.");return}console.log("Server: Saving chat message for user:",r);try{const o=P(this),s=await o.execute({sql:"PRAGMA table_info(chat_history)"});console.log("Chat history table structure:",s.rows);const i=s.rows.map(b=>b.name);console.log("Chat history columns:",i.join(", "));const u=s.rows.find(b=>b.name==="user_id"||b.name==="userId");if(!u){console.error("Server: chat_history table is missing the user_id/userId column!");return}const p=u.name;console.log(`Server: Using column name "${p}" for user ID`);try{const b=`INSERT INTO chat_history (${p}, role, content, timestamp) VALUES (?, ?, ?, ?)`,m=await o.execute({sql:b,args:[r,"user",t,new Date().toISOString()]});console.log("Server: User message saved successfully",m);const x=await o.execute({sql:b,args:[r,"assistant",a,new Date().toISOString()]});console.log("Server: Assistant message saved successfully",x)}catch(b){throw console.error("Server: SQL insert error:",b.message),b.message.includes("no column named")&&(console.error("Server: Column name error - check that column names match exactly with the schema"),console.error("Server: Available columns:",i.join(", ")),console.error("Server: Attempted to use column:",p)),b}console.log("Server: Chat messages saved successfully")}catch(o){console.error("Server: Error saving chat message to Turso:",o.message),console.error("Server: Error details:",o)}},"t5qavYemaxA"),mt=W(g(Eo,"s_t5qavYemaxA")),To=K(async function(l,t){if(!l){console.warn("Server: Cannot update language, user not logged in.");return}console.log("Server: Updating language for user:",l,"to",t);try{const a=P(this),r=await a.execute({sql:"PRAGMA table_info(users)"});console.log("Users table structure:",r.rows);const o=r.rows.find(s=>s.name.toLowerCase().includes("chatbot")&&s.name.toLowerCase().includes("lang"));if(o){const s=o.name;console.log(`Found language column: ${s}`),await a.execute({sql:`UPDATE users SET ${s} = ? WHERE id = ?`,args:[t,l]}),console.log("Server: User language updated successfully")}else console.error("Server: Couldn't find chatbot language column in users table")}catch(a){console.error("Server: Error updating user language in Turso:",a.message)}},"Q1ZuWs0UdZw"),So=W(g(To,"s_Q1ZuWs0UdZw")),Co=K(async function(l,t=50){if(!l)return console.warn("Server: Cannot load chat history, user not logged in."),[];console.log("Server: Loading chat history for user:",l);try{const o=(await P(this).execute({sql:"SELECT role, content, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC LIMIT ?",args:[l,t*2]})).rows.map(s=>({role:s.role,content:s.content,timestamp:s.timestamp}));if(console.log(`Server: Loaded ${o.length} chat history messages`),o.length>Ne){const s=Math.max(0,o.length-Ne),i=o[s].role==="assistant"?s-1:s,u=o.slice(Math.max(0,i));return console.log(`Server: Trimmed history from ${o.length} to ${u.length} messages`),u}return o}catch(a){return console.error("Server: Error loading chat history:",a.message),[]}},"PJb0eS0Gg0U");W(g(Co,"s_PJb0eS0Gg0U"));const Ao=async l=>{var o,s;const t=l.sharedMap.get("session");let a="en-US",r;if((o=t==null?void 0:t.user)!=null&&o.id)r=t.user.id;else{const i=(s=l.cookie.get("auth_token"))==null?void 0:s.value;if(!i)throw console.log("[CHAT] No authentication found, redirecting to login"),l.redirect(302,"/auth/");console.log("[CHAT] Using auth_token cookie for authentication"),r=i}try{const i=P(l),u=r,p=await i.execute({sql:"PRAGMA table_info(users)"});console.log("[CHAT] Users table structure:",p.rows);const b=p.rows.find(m=>m.name.toLowerCase().includes("chatbot")&&m.name.toLowerCase().includes("lang"));if(b){const m=b.name;console.log(`[CHAT] Found language column: ${m}`);const x=await i.execute({sql:`SELECT ${m} AS chatbot_language FROM users WHERE id = ? LIMIT 1`,args:[u]});if(x.rows.length>0&&x.rows[0].chatbot_language){const y=x.rows[0].chatbot_language;Ce.some(S=>S.value===y)?a=y:console.warn(`[CHAT] Loaded invalid language '${y}' for user ${r}, using default.`)}}else console.warn("[CHAT] Couldn't find chatbot language column in users table")}catch(i){console.error("[CHAT] Failed to load user language from DB:",i.message)}return{initialLanguage:a,userId:r,initialThreadId:crypto.randomUUID()}},bt=H(g(Ao,"s_2OxiK9FAl0U")),Io=()=>{const[l,t,a,r,o,s]=A();if(t.value||l.value){console.log("Not playing idle video while loading or initiating");return}const i=s.value;if(!i){console.error("Cannot play idle video - video element reference is null");return}console.log("Attempting to play idle video");const u=r.value,p=u&&u.connectionState==="connected";if(p&&i.srcObject instanceof MediaStream){if(i.srcObject.getVideoTracks().filter(x=>x.readyState==="live"&&!x.muted).length>0&&o.value){console.log("Active video stream with data is playing, not switching to idle");return}console.log("Switching to idle despite connection because stream is inactive")}if(i.srcObject instanceof MediaStream)try{const m=i.srcObject.getTracks();p?(console.log("Preserving WebRTC tracks while switching to idle"),m.forEach(x=>{console.log(`Track preserved: ${x.id}, kind: ${x.kind}, state: ${x.readyState}`)})):(console.log("No active connection, safely stopping all tracks"),m.forEach(x=>{console.log(`Stopping track: ${x.id}, kind: ${x.kind}, state: ${x.readyState}`),x.stop()}))}catch(m){console.warn("Error handling stream tracks:",m)}if(i.src&&i.src.includes("prs_daioff.idle.mp4")&&!i.paused&&!i.ended&&i.readyState>=3){console.log("Idle video already playing correctly, no need to restart");return}i.srcObject=null,i.pause(),i.removeAttribute("srcObject"),i.currentTime=0;const b=window.location.origin+"/prs_daioff.idle.mp4";console.log("Idle video path:",b);try{i.removeAttribute("src"),i.load(),i.muted=!0,i.loop=!0,i.style.display="block",i.autoplay=!0,i.playsInline=!0,i.controls=!1,i.src=b,i.load(),console.log("Video configured, attempting to play idle video");const m=()=>i.play().then(()=>(console.log("Idle video playing successfully"),o.value=!1,setTimeout(()=>{i.muted=a.value},300),!0)).catch(x=>(console.error("Error playing idle video:",x),!1));m().then(x=>{x||(console.log("Retrying with forced mute after delay"),i.muted=!0,setTimeout(()=>{m().then(y=>{y||(console.log("Final retry with video reload"),i.load(),i.muted=!0,i.autoplay=!0,i.currentTime=0,i.play().catch(_=>{console.error("All idle video play attempts failed:",_)}))})},500))})}catch(m){console.error("Exception setting up idle video:",m)}},Ro=(l,t)=>{const[a,r,o,s,i]=A();console.log("Video status change called - isPlaying:",l,"stream exists:",!!t);const u=a.value||r.value;if(l&&t){const p=t.getVideoTracks(),b=p.length>0&&p.some(m=>m.readyState==="live");if(console.log(`Stream has ${p.length} video tracks, active: ${b}`),b){if(console.log("Setting active video stream with live tracks"),u){console.log("Currently initiating or loading, scheduling stream for later"),setTimeout(()=>{if(i.value){console.log("Setting delayed video stream");const m=i.value;!m.srcObject||!(m.srcObject instanceof MediaStream)||m.srcObject.getVideoTracks().length===0?(console.log("Setting stream with safe transition"),m.srcObject=t,m.muted=o.value,m.style.display="block",m.play().catch(x=>{console.error("Error playing delayed video:",x),x.name==="NotAllowedError"&&(m.muted=!0,m.play().catch(y=>console.error("Still cannot play video:",y)))})):console.log("Video already has a valid srcObject, skipping update")}},1e3);return}if(i.value)try{const m=i.value;m.src&&(m.pause(),m.removeAttribute("src"),m.load()),console.log("Setting stream directly to video element"),m.srcObject=t,m.muted=o.value,m.style.display="block";const x=m.play();x!==void 0&&x.catch(y=>{console.error("Error playing video:",y),y.name==="NotAllowedError"&&(m.muted=!0,m.play().catch(_=>console.error("Still cannot play video:",_)))})}catch(m){console.error("Error setting video stream:",m)}else console.warn("Video ref is null, cannot set stream")}else console.log("Stream has no active tracks or all tracks ended"),u?console.log("Processing in progress, keeping current video state"):(console.log("No processing in progress, switching to idle video"),s())}else u?console.log("Loading or initiating, not switching to idle video yet"):(console.log("No active stream, playing idle video"),s())},Do=()=>{const[l]=A(),t=l.value;t&&console.log("ICE gathering state:",t.iceGatheringState)},Lo=async l=>{const[t,a,r]=A(),o=t.value;if(!l.candidate||!r.value||!a.value||!o)return;console.log("ICE candidate:",l.candidate);const{candidate:s,sdpMid:i,sdpMLineIndex:u}=l.candidate;try{await it(r.value,a.value,{candidate:s,sdpMid:i,sdpMLineIndex:u})}catch(p){console.error("Client: Failed to send ICE candidate via server:",p)}},No=()=>{const[l,t,a,r]=A(),o=r.value;if(!o)return;const s=o.iceConnectionState;console.log("ICE connection state:",s),s==="connected"||s==="completed"?(a.value&&(clearTimeout(a.value),a.value=null),l.value=!0,t.value=null,console.log("Connection established successfully")):(s==="failed"||s==="closed"||s==="disconnected")&&(console.error("ICE connection failed or closed"),closePC$(!1),l.value=!1,t.value="Connection failed. Please try reconnecting.")},Mo=()=>{const[l,t,a]=A(),r=a.value;if(!r)return;const o=r.connectionState;console.log("Peer connection state:",o),o==="connected"?(l.value=!0,t.value=null):(o==="failed"||o==="closed")&&(l.value=!1,t.value="Connection failed. Please try reconnecting.",closePC$(!1))},Oo=()=>{const[l]=A(),t=l.value;t&&console.log("Signaling state:",t.signalingState)},jo=l=>{const[t,a,r,o,s,i,u,p]=A();console.log("onTrack event fired:",l);const b=s.value;if(!l.track||!b){console.log("onTrack: Event received but no valid track or PC found.");return}console.log(`Track received: ${l.track.id}, kind: ${l.track.kind}, state: ${l.track.readyState}`),l.track.addEventListener("ended",()=>{console.log(`Track ended: ${l.track.id}, kind: ${l.track.kind}`)}),l.track.addEventListener("unmute",()=>{if(console.log(`Track unmuted: ${l.track.id}, kind: ${l.track.kind}`),l.streams&&l.streams.length>0){const m=l.streams[0];if(l.track.kind==="video"&&m.getVideoTracks().length>0)if(console.log("Video stream available after unmute"),!a.value||u.value){const x=p.value;x&&(console.log("Setting unmuted stream directly to video element"),x.srcObject=m,x.style.display="block",x.muted=r.value,x.play().catch(y=>{console.error("Error playing unmuted stream:",y),y.name==="NotAllowedError"&&(x.muted=!0,x.play().catch(_=>{console.error("Still cannot play unmuted stream:",_)}))}))}else console.log("Not setting video element yet as we are still loading or waiting for active tracks")}}),i.value&&(clearInterval(i.value),i.value=null),i.value=setInterval(async()=>{if(!b||b.connectionState!=="connected"){i.value&&clearInterval(i.value),i.value=null;return}try{const m=b.getReceivers();let x=!1,y=0;const _=m.filter(S=>S.track&&S.track.kind==="video"&&S.track.readyState==="live").map(S=>S.track);console.log(`Found ${_.length} active video tracks`),_.length>0&&(await b.getStats()).forEach(T=>{if(T.type==="inbound-rtp"&&"mediaType"in T&&T.mediaType==="video"){x=!0;const v="bytesReceived"in T?T.bytesReceived:0;y+=v;const h=v>t.value&&v>0;if(u.value!==h)if(u.value=h,h){console.log("D-ID video stream now actively receiving data, switching from idle");const M=m.filter(f=>f.track&&f.track.readyState==="live").map(f=>f.track),j=new MediaStream(M);o(!0,j)}else a.value||(console.log("D-ID video stream paused, reverting to idle"),o(!1,null));t.value=y}}),!x&&u.value&&(console.log("No active video tracks found in stats"),u.value=!1,a.value||o(!1,null))}catch(m){console.error("Error getting stats:",m)}},1e3),console.log("Track handler set up, waiting for active video data before switching from idle")},Po=(l=!0)=>{const[t,a,r,o,s,i,u,p,b,m,x,y,_,S,T,v]=A(),h=m.value;if(!h)return;console.log("Client: Closing peer connection"),h.removeEventListener("icegatheringstatechange",u),h.removeEventListener("icecandidate",s),h.removeEventListener("iceconnectionstatechange",i),h.removeEventListener("connectionstatechange",o),h.removeEventListener("signalingstatechange",p),h.removeEventListener("track",b),_.value&&(clearInterval(_.value),_.value=null),a.value&&(clearTimeout(a.value),a.value=null);const w=v.value;if(w!=null&&w.srcObject&&w.srcObject instanceof MediaStream){console.log("Stopping tracks during PC close - this IS the right place to stop tracks");const M=w.srcObject.getTracks();console.log(`Stopping ${M.length} tracks during peer connection close`),M.forEach(j=>{console.log(`Stopping track: ${j.id}, kind: ${j.kind}, state: ${j.readyState}`),j.stop()}),w.srcObject=null}h.close(),m.value=null,t.value=!1,T.value=!1,r.value=0,console.log("Client: Peer connection closed"),l&&S.value&&y.value&&(ut(S.value,y.value).catch(M=>{console.error("Client: Error during server close stream:",M)}),S.value="",y.value=""),setTimeout(()=>{x(),console.log("Reproduciendo video de espera después de cerrar conexión")},500)},Uo=async(l,t)=>{const[a,r,o,s,i,u,p,b]=A();b.value&&(console.warn("Closing existing peer connection before creating new one."),a(!1));try{console.log("Client: Creating Peer Connection");const m=new RTCPeerConnection({iceServers:t});m.addEventListener("icegatheringstatechange",i),m.addEventListener("icecandidate",o),m.addEventListener("iceconnectionstatechange",s),m.addEventListener("connectionstatechange",r),m.addEventListener("signalingstatechange",u),m.addEventListener("track",p),console.log("Client: Setting remote description"),await m.setRemoteDescription(l),console.log("Client: Creating answer");const x=await m.createAnswer();return console.log("Client: Setting local description"),await m.setLocalDescription(x),b.value=cl(m),x}catch(m){throw console.error("Client: Error creating peer connection:",m),b.value=null,m}},$o=async()=>{const[l,t,a,r,o,s,i,u,p,b]=A();if(!(t.value||s.value)){s.value=!0,a.value=null,l(!1);try{u(),console.log("Client: Calling serverInitConnection");const{streamId:m,offer:x,iceServers:y,sessionId:_}=await ot();b.value=m,p.value=_,console.log("Client: Stream/Session IDs received:",m,_),console.log("Client: Creating peer connection with offer");const S=await o(x,y);console.log("Client: Sending SDP answer via server"),await st(m,_,S),r.value&&clearTimeout(r.value),r.value=setTimeout(()=>{if(!t.value){console.error("Connection timeout - checking status");const T=i.value;T&&(T.iceConnectionState==="checking"||T.iceConnectionState==="connected"||T.iceConnectionState==="completed")?(console.log("Connection appears stable despite timeout - forcing connected state"),t.value=!0,a.value=null):(console.error("Connection truly timed out"),a.value="Connection timed out. Please try reconnecting.",l(!0))}},15e3),console.log("Client: Waiting for ICE connection...")}catch(m){console.error("Client: Error during connection initialization:",m),a.value=`Connection error: ${m.message||"Unknown error"}`,l(!0),t.value=!1,b.value="",p.value="",setTimeout(()=>{u(),console.log("Attempting to play idle video after connection error")},1e3)}finally{s.value=!1}}},zo=()=>{const[l,t]=A();l.value=!l.value,t.value&&(t.value.muted=l.value),console.log(`Video ${l.value?"muted":"unmuted"}`)},Fo=()=>{const[l]=A();console.log("Manual reconnect triggered"),l()},Bo=async l=>{var j;const[t,a,r,o,s,i,u,p,b,m,x,y,_,S,T,v,h,w,M]=A();if(l.trim()){b.value=!0,o.value=null,t.push({role:"user",content:l}),u.value&&(u.value.value="");try{console.log("Client: Fetching LangChain response with chat history context");const f=t.map($=>({role:$.role,content:$.content})),Q=await gt(l,h.value,oe[s.language]||"English",f);if(t.push({role:"assistant",content:Q}),(j=i.value)!=null&&j.userId&&mt(S.value||"no-session",l,Q,i.value.userId).catch($=>console.error("Client: Failed to save chat message:",$)),m.value){console.log("Video muted, skipping talk creation."),b.value=!1;return}if(!r.value||!v.value||!S.value){console.warn("Not connected, attempting to connect before talk...");try{if(await a(),await new Promise($=>setTimeout($,3e3)),!r.value||!v.value||!S.value){console.error("Connection failed after reconnect attempt, cannot create talk."),o.value="Connection failed. Cannot play response.",b.value=!1;return}console.log("Successfully reconnected, proceeding with talk creation")}catch($){console.error("Error during reconnection attempt:",$),o.value="Connection failed. Cannot play response.",b.value=!1;return}}if(!r.value||!v.value||!S.value){console.error("Still not connected, cannot create talk."),o.value="Not connected. Cannot play response.",b.value=!1;return}console.log("Client: Creating talk");const te=at(s.language);if(await ct(Q,te,v.value,S.value),console.log("Client: Talk request sent"),y.value&&M.value){console.log("Setting up enhanced talk stream detection"),w.value=!1,p.value=0,T.value&&(clearInterval(T.value),T.value=null);const $=y.value;T.value=setInterval(async()=>{if(!$||$.connectionState!=="connected"){T.value&&(clearInterval(T.value),T.value=null);return}try{const D=$.getReceivers(),q=D.filter(z=>z.track&&z.track.kind==="video"&&z.track.readyState==="live").map(z=>z.track);if(console.log(`Found ${q.length} active video tracks`),q.length>0){const z=await $.getStats();let ce=!1,le=0;z.forEach(J=>{if(J.type==="inbound-rtp"&&"mediaType"in J&&J.mediaType==="video"){if(le="bytesReceived"in J?J.bytesReceived:0,ce=le>p.value&&le>0,ce&&!w.value){console.log("Talk video stream now active with data flow"),w.value=!0;const Je=D.filter(be=>be.track&&be.track.readyState==="live").map(be=>be.track),ke=new MediaStream(Je);x(!0,ke)}p.value=le}}),!ce&&w.value&&!b.value&&(console.log("Talk video stream has no active data flow, reverting to idle"),w.value=!1,x(!1,null))}else w.value&&!b.value&&(console.log("No active video tracks found, reverting to idle"),w.value=!1,x(!1,null))}catch(D){console.error("Error monitoring video stream:",D)}},750);const re=$.getReceivers(),ne=re.filter(D=>D.track&&D.track.kind==="video"&&D.track.readyState==="live").map(D=>D.track);setInterval(()=>{if(ne.length>0){console.log(`Initial check: Found ${ne.length} active video tracks`),ne.forEach(q=>{console.log(`Ensuring video track is enabled: ${q.id}`),q.enabled=!0});const D=re.filter(q=>q.track&&q.track.readyState==="live").map(q=>q.track);try{const q=new MediaStream(D),z=M.value;z&&(!z.srcObject||z.srcObject.getVideoTracks().length===0||z.srcObject.getVideoTracks()[0].readyState!=="live")&&(console.log("Updating video element with active stream"),z.srcObject=q,z.muted=m.value,z.style.display="block",z.play().catch(le=>{console.error("Error playing video:",le),le.name==="NotAllowedError"&&(z.muted=!0,z.play().catch(J=>{console.error("Still cannot play video:",J)}))}))}catch(q){console.error("Error creating media stream:",q)}}},300)}}catch(f){console.error("Client: Error during startTalk:",f),t.push({role:"assistant",content:`Error: ${f.message||"Could not process request."}`}),o.value=`Error: ${f.message||"Could not process request."}`,M.value&&_()}finally{b.value=!1}}},Ho=()=>{const[l,t]=A();l.value&&l.value.value.trim()&&t(l.value.value)},qo=l=>{const[t,a]=A();l.key==="Enter"&&t.value&&t.value.value.trim()&&a(t.value.value)},Vo=async l=>{const[t,a,r,o]=A();r.value=!0,t.push({role:"assistant",content:`Procesando grabación de voz en ${Xe(a.language)} ${oe[a.language]||"English"}...`});try{const s=await l.arrayBuffer(),i=btoa(new Uint8Array(s).reduce((p,b)=>p+String.fromCharCode(b),""));console.log("Client: Audio converted to base64, size:",i.length),console.log(`Client: Processing voice recording in ${a.language} (${oe[a.language]||"English"})`),t.length>0&&t[t.length-1].role==="assistant"&&t[t.length-1].content.startsWith("Procesando grabación de voz")&&t.pop();const u=await pt(i,l.type,oe[a.language]||"English");u&&!u.startsWith("Error:")?(console.log(`Client: Transcription successful in ${a.language}: "${u}"`),await o(u)):(console.error(`Client: Transcription failed in ${a.language}:`,u),t.push({role:"assistant",content:`No pude procesar correctamente el audio en ${oe[a.language]||"English"}. Por favor, intenta de nuevo o escribe tu mensaje.`}))}catch(s){console.error(`Client: Error processing audio in ${a.language}:`,s),t.length>0&&t[t.length-1].role==="assistant"&&t[t.length-1].content.startsWith("Procesando grabación de voz")&&t.pop();const i=`Lo siento, hubo un problema procesando tu grabación en ${Xe(a.language)} ${oe[a.language]}. ${s.message}`;t.push({role:"assistant",content:i})}finally{r.value=!1}},Yo=async()=>{const[l,t,a,r,o,s]=A();if(!t.value)try{const i={audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0,sampleRate:48e3}};console.log(`Client: Starting voice recording for language: ${l.language} (${oe[l.language]||"English"})`);const u=await navigator.mediaDevices.getUserMedia(i);let p="audio/webm;codecs=opus";MediaRecorder.isTypeSupported(p)||(p="audio/webm",console.log("Client: Opus codec not supported, using standard audio/webm"));const b=new MediaRecorder(u,{mimeType:p,audioBitsPerSecond:128e3});r.value=cl(b);const m=[];b.addEventListener("dataavailable",x=>{m.push(x.data)}),b.addEventListener("stop",async()=>{const x=new Blob(m,{type:b.mimeType});console.log("Found",u.getVideoTracks().length,"active video tracks"),u.getTracks().forEach(y=>y.stop()),t.value=!1,r.value=null,s.value&&clearInterval(s.value),o.value=0,x.size>0?await a(x):console.log("Empty recording, skipping processing.")}),b.start(),t.value=!0,o.value=0,s.value&&clearInterval(s.value),s.value=setInterval(()=>{o.value++},1e3),setTimeout(()=>{b.state==="recording"&&b.stop()},3e4)}catch(i){console.error("Error starting recording:",i),t.value=!1,alert("Could not start recording. Please ensure microphone permission is granted.")}},Xo=()=>{const[l,t]=A();l.value&&l.value.state==="recording"&&l.value.stop(),t.value&&(clearInterval(t.value),t.value=null)},Go=()=>{const[l,t,a]=A();l.value?a():t()},Wo=()=>{var el,ll,tl;G(),Me(g(ht,"s_k00z89YFKEE"));const l=bt(),t=E(""),a=E(""),r=E(!1),o=E(!1),s=E(!1),i=E(!1),u=E(null),p=E(!1),b=E(0),m=E(((el=l.value)==null?void 0:el.initialThreadId)??crypto.randomUUID()),x=de([]),y=E(!1),_=de({userResponse:"",language:((ll=l.value)==null?void 0:ll.initialLanguage)??"en-US"}),S=E(),T=E(),v=E(),h=E(null),w=E(null),M=E(null),j=E(null),f=E(0),Q=E(!1),te=E(null),$=g(Io,"s_N9e0IU0A4bo",[o,s,i,h,Q,S]),re=g(Ro,"s_Ju0f19q15Rc",[o,s,i,$,S]),ne=g(Do,"s_aAUOe9s9Jkk",[h]),D=g(Lo,"s_HvRDpFr97uM",[h,a,t]),q=g(No,"s_EF7Cga3ZMCg",[r,u,te,h]),z=g(Mo,"s_MPQKybcKuto",[r,u,h]),ce=g(Oo,"s_hlWBljykoJs",[h]),le=g(jo,"s_WBCTWzxfig4",[f,s,i,re,h,j,Q,S]),J=g(Po,"s_Y50Opu7cRuk",[r,te,f,z,D,q,ne,ce,le,h,$,a,j,t,Q,S]),ke=g($o,"s_F0oEfzF8QA8",[J,r,u,te,g(Uo,"s_84iu1gesId0",[J,z,D,q,ne,ce,le,h]),o,h,$,a,t]);U(k("s_sXBaPboedo4",[J,ke,r,te,$,j,M])),U(k("s_rueDjDgQosU",[x,y,l])),U(k("s_jqWZtbrPWYE",[x,T]));const be=g(zo,"s_ZXBOyQKfLYM",[i,S]),$t=g(Fo,"s_QG1bFHMosqw",[ke]),Ue=g(Bo,"s_ir1spm36TUU",[x,ke,r,u,_,l,v,f,s,i,re,h,$,a,j,t,m,Q,S]),zt=g(Ho,"s_SVXZb4uUvRs",[v,Ue]),Ft=g(qo,"s_6fbfSHCjrkg",[v,Ue]),Bt=g(Go,"s_dxWeK02kSMA",[p,g(Yo,"s_NCM2QYVvCRs",[_,p,g(Vo,"s_nlB6T0j3ySQ",[x,_,s,Ue]),w,b,M]),g(Xo,"s_iZrhr7O0pfk",[w,M])]);return U(k("s_YAGfxIvYiGw")),e("div",null,{class:"chat-container",style:{height:"var(--available-height, 70vh)"}},[e("div",null,{class:"video-panel"},[e("video",{ref:S},{id:"talk-video",autoplay:!0,playsInline:!0,muted:d(L=>L.value,[i],"p0.value"),class:"video-element",preload:"auto"},null,3,null),s.value&&e("div",null,{class:"video-processing-indicator"},[c(Ie,null,3,"Ba_0"),e("span",null,null,"Processing...",3,null)],1,"Ba_1"),o.value&&e("div",null,{class:"video-connecting-overlay"},[c(Ie,null,3,"Ba_2"),e("p",null,null,"Connecting to Avatar...",3,null)],1,"Ba_3"),e("div",null,{class:"control-panel"},[e("div",null,{class:"control-left"},e("div",null,{class:"language-icons"},Ce.map(L=>e("button",{class:`lang-icon-btn ${_.language===L.value?"active":""}`,title:O(L,"label"),"aria-label":O(L,"label"),dangerouslySetInnerHTML:O(L,"flagSvg"),onClick$:k("s_zgjxndRmwSE",[_,l,L])},null,null,2,L.value)),1,null),1,null),e("div",null,{class:"control-right"},!r.value&&!o.value&&e("button",null,{class:"connect-button",onClick$:$t},"Connect",3,"Ba_4"),1,null)],1,null)],1,null),e("div",null,{class:"chat-panel"},[e("div",{ref:T},{class:"chat-messages"},[x.map((L,ue)=>e("div",{class:`message-container ${L.role==="user"?"user-message":"assistant-message"}`},null,e("div",{class:`message-bubble ${L.role==="user"?"user-bubble":"assistant-bubble"}`},null,[e("div",null,{class:"message-sender"},L.role==="user"?"You":"Assistant",1,null),e("p",null,{class:"message-content"},O(L,"content"),1,null)],1,null),1,ue)),s.value&&((tl=x[x.length-1])==null?void 0:tl.role)==="user"&&e("div",null,{class:"message-container assistant-message"},e("div",null,{class:"message-bubble assistant-bubble"},[e("div",null,{class:"message-sender"},"Assistant",3,null),e("div",null,{class:"typing-indicator"},[e("span",null,null,null,3,null),e("span",null,null,null,3,null),e("span",null,null,null,3,null)],3,null)],3,null),3,"Ba_5")],1,null),e("div",null,{class:"chat-input-container fixed-mobile-input"},e("div",null,{class:"chat-input-wrapper"},[e("button",null,{class:"volume-button control-btn","aria-label":d(L=>L.value?"Unmute Video":"Mute Video",[i],'p0.value?"Unmute Video":"Mute Video"'),onClick$:be},i.value?c(Bn,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_6"):c(Fn,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_7"),1,null),e("div",null,{class:"language-icons desktop-only"},Ce.map(L=>e("button",{class:`lang-icon-btn ${_.language===L.value?"active":""}`,title:O(L,"label"),"aria-label":O(L,"label"),dangerouslySetInnerHTML:O(L,"flagSvg"),onClick$:k("s_C6PrDmqOBSo",[_,l,L])},null,null,2,L.value)),1,null),e("button",null,{disabled:d((L,ue)=>L.value||ue.value,[o,s],"p0.value||p1.value"),class:d(L=>`mic-button ${L.value?"recording":""}`,[p],'`mic-button ${p0.value?"recording":""}`'),"aria-label":d(L=>L.value?"Stop Recording":"Start Recording",[p],'p0.value?"Stop Recording":"Start Recording"'),onClick$:Bt},p.value?c(In,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_8"):c(An,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_9"),1,null),e("input",{ref:v},{type:"text",placeholder:d(L=>L.value?"Connecting...":"Type a message...",[o],'p0.value?"Connecting...":"Type a message..."'),disabled:d((L,ue)=>L.value||ue.value,[o,s],"p0.value||p1.value"),class:"chat-input",onKeyUp$:Ft},null,3,null),e("button",null,{disabled:d((L,ue)=>L.value||ue.value,[o,s],"p0.value||p1.value"),class:"send-button",onClick$:zt},s.value?c(Ie,{size:"small",[n]:{size:n}},3,"Ba_10"):c(_l,{class:"w-4 h-4",[n]:{class:n}},3,"Ba_11"),1,null)],1,null),1,null)],1,null)],1,"Ba_12")},Ko=N(g(Wo,"s_MrD3ZY10mAo")),Qo=l=>{const t=(l.size??"medium")==="small"?"w-4 h-4 border-2":"w-5 h-5 border-[3px]";return e("div",{class:`animate-spin rounded-full ${t} border-white border-t-transparent`},{role:"status","aria-label":"loading"},null,3,"Ba_13")},Ie=N(g(Qo,"s_0l795rBK8oI")),ht=`
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
   background-color: #e53e3e; /* Already using red */
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
  box-shadow: 0 0 0 2px #e53e3e, 0 0 0 4px rgba(229, 62, 62, 0.3); /* Already using red */
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
  background-color: #e53e3e; /* Already using red */
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
`,Zo=Object.freeze(Object.defineProperty({__proto__:null,STYLES:ht,Spinner:Ie,_auto_DID_API_URL:ye,_auto_MAX_CONTEXT_MESSAGES:Ne,_auto_fetchWithRetries:ie,_auto_getAuthHeader:we,_auto_getLanguageCode:Xe,_auto_getVoiceSettings:at,_auto_languageMap:oe,_auto_languages:Ce,_auto_processTextForVoice:rt,_auto_serverCloseStream:ut,_auto_serverCreateTalk:ct,_auto_serverFetchLangChainResponse:gt,_auto_serverInitConnection:ot,_auto_serverProcessAudio:pt,_auto_serverSaveChatMessage:mt,_auto_serverSendIceCandidate:it,_auto_serverSendSdpAnswer:st,_auto_serverUpdateUserLang:So,_auto_trimChatHistory:dt,default:Ko,useInitialData:bt},Symbol.toStringTag,{value:"Module"})),Jo=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:d(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("polyline",null,{points:"16 18 22 12 16 6"},null,3,null),e("polyline",null,{points:"8 6 2 12 8 18"},null,3,null)],3,"Hi_0"),Re=N(g(Jo,"s_8P7p3IpX6Fs")),es=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:d(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"1",y:"4",width:"22",height:"16",rx:"2",ry:"2"},null,3,null),e("line",null,{x1:"1",y1:"10",x2:"23",y2:"10"},null,3,null)],3,"Hi_3"),ft=N(g(es,"s_TB03ynRd0Wg")),ls=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:d(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"4",y:"2",width:"16",height:"20",rx:"2",ry:"2"},null,3,null),e("line",null,{x1:"9",y1:"6",x2:"15",y2:"6"},null,3,null),e("line",null,{x1:"9",y1:"10",x2:"15",y2:"10"},null,3,null),e("line",null,{x1:"9",y1:"14",x2:"15",y2:"14"},null,3,null)],3,"Hi_4"),xt=N(g(ls,"s_2vNnYhGWGdw")),ts=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:d(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"},null,3,null),e("path",null,{d:"M7 11V7a5 5 0 0 1 10 0v4"},null,3,null)],3,"Hi_5"),vt=N(g(ts,"s_z2RZqqZkmR4")),ns=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:d(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("ellipse",null,{cx:"12",cy:"5",rx:"9",ry:"3"},null,3,null),e("path",null,{d:"M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"},null,3,null),e("path",null,{d:"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"},null,3,null)],3,"Hi_6"),yt=N(g(ns,"s_0s3q0rsbMcs")),as=`
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
  `,rs=l=>{const[t]=A();t.value=l},os=l=>{const[t]=A();t.value=l;const a=document.getElementById(l);a&&a.scrollIntoView({behavior:"smooth",block:"start"})},ss=()=>{Me(g(as,"s_uYBjZvZkxow"));const l=E("architecture"),t=E("arch-overview"),a=E(),r=E(),o=E(),s=g(rs,"s_85Fk8Ri0Dl8",[l]),i=g(os,"s_Yh9AXSXas0Q",[t]);return U(k("s_JwNEufPc0dE")),e("div",null,{class:"flex flex-col min-h-screen bg-white dark:bg-gray-900"},[e("div",null,{class:"bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-16 px-4"},e("div",null,{class:"max-w-5xl mx-auto"},[e("h1",null,{class:"text-4xl md:text-5xl font-extrabold mb-4"},"Documentación Técnica",3,null),e("p",null,{class:"text-xl text-indigo-100 max-w-3xl"},"Guía completa de la plataforma TokenEstate para desarrolladores, arquitectos y usuarios técnicos",3,null)],3,null),3,null),e("div",null,{class:"max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8"},[e("div",null,{class:"md:w-64 flex-shrink-0"},e("div",null,{class:"sticky top-8"},[e("div",null,{class:"p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6"},[e("h3",null,{class:"font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200"},"Contenido",3,null),e("nav",null,{class:"space-y-1"},[e("a",null,{href:"#arch-overview",class:d(u=>`toc-link ${u.value==="arch-overview"?"active":""}`,[t],'`toc-link ${p0.value==="arch-overview"?"active":""}`'),onClick$:k("s_0Sd7oecTTOI",[i])},"Arquitectura",3,null),e("a",null,{href:"#system-layers",class:d(u=>`toc-link ${u.value==="system-layers"?"active":""}`,[t],'`toc-link ${p0.value==="system-layers"?"active":""}`'),onClick$:k("s_F2UsykvfDcU",[i])},"Capas del Sistema",3,null),e("a",null,{href:"#smart-contracts",class:d(u=>`toc-link ${u.value==="smart-contracts"?"active":""}`,[t],'`toc-link ${p0.value==="smart-contracts"?"active":""}`'),onClick$:k("s_KEqv48ErNIg",[i])},"Contratos Inteligentes",3,null),e("a",null,{href:"#security",class:d(u=>`toc-link ${u.value==="security"?"active":""}`,[t],'`toc-link ${p0.value==="security"?"active":""}`'),onClick$:k("s_SF0LrlyNP5s",[i])},"Seguridad y Auditoría",3,null),e("a",null,{href:"#timeline",class:d(u=>`toc-link ${u.value==="timeline"?"active":""}`,[t],'`toc-link ${p0.value==="timeline"?"active":""}`'),onClick$:k("s_bDXXA45JnUE",[i])},"Cronograma",3,null)],3,null)],3,null),e("div",null,{class:"p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"},[e("h3",null,{class:"font-semibold text-lg mb-3 text-indigo-800 dark:text-indigo-300"},"Recursos",3,null),e("ul",null,{class:"space-y-2 text-sm"},[e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"📄",3,null)," Whitepaper técnico"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"💻",3,null)," Repositorio de código"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"🧪",3,null)," Testnet Demo"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"💬",3,null)," Canal de Discord"],3,null),3,null)],3,null)],3,null)],3,null),3,null),e("div",null,{class:"flex-1"},[e("div",null,{class:"border-b border-gray-200 dark:border-gray-700 mb-8"},e("div",null,{class:"flex"},[e("button",null,{class:d(u=>`tab ${u.value==="architecture"?"active":""}`,[l],'`tab ${p0.value==="architecture"?"active":""}`'),onClick$:k("s_Tb896FU2TvI",[s])},"Arquitectura",3,null),e("button",null,{class:d(u=>`tab ${u.value==="contracts"?"active":""}`,[l],'`tab ${p0.value==="contracts"?"active":""}`'),onClick$:k("s_jAmpfQOwVW8",[s])},"Contratos",3,null),e("button",null,{class:d(u=>`tab ${u.value==="security"?"active":""}`,[l],'`tab ${p0.value==="security"?"active":""}`'),onClick$:k("s_x0ZhfQ6FRlE",[s])},"Seguridad",3,null),e("button",null,{class:d(u=>`tab ${u.value==="implementation"?"active":""}`,[l],'`tab ${p0.value==="implementation"?"active":""}`'),onClick$:k("s_1RvbHfL96oo",[s])},"Implementación",3,null)],3,null),3,null),e("div",null,{class:d(u=>`tab-content ${u.value==="architecture"?"active":""}`,[l],'`tab-content ${p0.value==="architecture"?"active":""}`')},[e("section",{ref:a},{id:"arch-overview",class:"mb-12 section"},[e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Arquitectura del Sistema",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"La plataforma TokenEstate está diseñada con una arquitectura modular y escalable que permite la tokenización, comercialización y gestión de propiedades inmobiliarias a través de tecnología blockchain. Esta sección describe la arquitectura general y los componentes clave del sistema.",3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Componentes Principales",3,null),e("div",null,{class:"grid md:grid-cols-2 gap-6"},[e("div",null,null,[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"Frontend",3,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Aplicación web desarrollada con Qwik y React",3,null),e("li",null,null,"Interfaz para usuarios, propietarios y administradores",3,null),e("li",null,null,"Integración con billeteras Web3",3,null)],3,null)],3,null),e("div",null,null,[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"Blockchain",3,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Implementado sobre red EVM-compatible",3,null),e("li",null,null,"Smart Contracts para tokens NFT (propiedades)",3,null),e("li",null,null,"Smart Contracts para tokens KNRT (pagos)",3,null)],3,null)],3,null),e("div",null,{class:"border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[c(yt,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"Hi_9"),"Backend"],1,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"API REST para metadatos y funciones auxiliares",3,null),e("li",null,null,"Base de datos SQL para información no-blockchain",3,null),e("li",null,null,"Servicios de autenticación y verificación",3,null)],3,null),e("div",null,{class:"snippet-tag bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"},"TursoDb & Node.js",3,null)],1,null),e("div",null,{class:"border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[c(Re,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"Hi_10"),"Integración"],1,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Oráculos blockchain (Chainlink)",3,null),e("li",null,null,"IPFS para almacenamiento descentralizado",3,null),e("li",null,null,"Servicios KYC y verificación legal",3,null)],3,null),e("div",null,{class:"snippet-tag bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"},"Integraciones API",3,null)],1,null)],1,null),e("div",null,{class:"mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"},[e("h4",null,{class:"font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"},"Tecnologías Clave",3,null),e("div",null,{class:"flex flex-wrap gap-2"},[e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"Solidity",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"Qwik.js",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"ERC721",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"ERC20",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"IPFS",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"TursoDb",3,null)],3,null)],3,null)],1,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Flujo de Datos",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"El flujo de datos entre los componentes del sistema sigue un patrón de comunicación asíncrono con verificaciones en múltiples niveles para garantizar la integridad y consistencia:",3,null),e("ol",null,{class:"list-decimal pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("strong",null,null,"Solicitud de usuario",3,null),": Iniciada desde la interfaz frontend"],3,null),e("li",null,null,[e("strong",null,null,"Validación local",3,null),": Verificación preliminar en el cliente"],3,null),e("li",null,null,[e("strong",null,null,"API Backend",3,null),": Procesamiento y preparación de transacciones"],3,null),e("li",null,null,[e("strong",null,null,"Firma de transacción",3,null),": Usuario firma con su billetera Web3"],3,null),e("li",null,null,[e("strong",null,null,"Procesamiento blockchain",3,null),": Transacción procesada por smart contracts"],3,null),e("li",null,null,[e("strong",null,null,"Confirmación",3,null),": Resultados verificados y notificados al usuario"],3,null)],3,null)],3,null)],1,null),e("section",{ref:r},{id:"system-layers",class:"mb-12 section"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Capas del Sistema",3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"1. Capa de Blockchain",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("p",null,{class:"text-gray-700 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Red:",3,null)," Ethereum o red EVM-compatible (como Base) para optimizar costos de transacción."],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Esta capa proporciona la infraestructura descentralizada sobre la que se ejecutan los contratos inteligentes. Se accede a través de nodos RPC y se monitorea mediante servicios de indexación para un rendimiento óptimo.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"2. Capa de Smart Contracts",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato ERC721:",3,null)," Tokenización y registro de inmuebles."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato ERC20:",3,null)," Gestión del token de pago KNRT."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato Marketplace:",3,null)," Listado, compra/venta y transferencia de NFTs."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato de Alquiler:",3,null)," Gestión de contratos de arrendamiento."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato de Escrow:",3,null)," Bloqueo y liberación de tokens según condiciones."],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Los contratos inteligentes están implementados en Solidity v0.8.22 o superior, con un enfoque en la seguridad, eficiencia de gas y facilidad de actualización. Siguen patrones establecidos como proxy actualizable y control de acceso basado en roles.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"3. Capa de Interfaz de Usuario",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Frontend:",3,null)," Aplicación web desarrollada en Qwik.js"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Integración Web3:",3,null)," Ethers.js para interactuar con la blockchain"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"La interfaz de usuario está diseñada para ser intuitiva y responsiva, con soporte para múltiples billeteras y optimización para dispositivos móviles y de escritorio. Implementa principios de diseño centrado en el usuario y accesibilidad.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"4. Capa de Backend",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Servidores:",3,null)," Node.js para API y servicios auxiliares"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Base de datos:",3,null)," SQL para almacenamiento estructurado"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"IPFS:",3,null)," Almacenamiento descentralizado para metadatos"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"La capa de backend gestiona operaciones que requieren procesamiento fuera de la cadena, como la generación de metadatos, el almacenamiento de documentos legales y la indexación para búsquedas eficientes de propiedades.",3,null)],3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"5. Integraciones Adicionales",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Oráculos:",3,null)," Chainlink para validar condiciones externas"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"KYC/AML:",3,null)," Servicios de verificación de identidad"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Pasarelas de Pago:",3,null)," Integración fiat-cripto (opcional)"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Estas integraciones extienden la funcionalidad del sistema, permitiendo una conexión segura con sistemas externos y cumplimiento de requisitos regulatorios.",3,null)],3,null)],3,null),e("section",{ref:o},{id:"smart-contracts",class:"mb-12 section"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Contratos Inteligentes",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"Los contratos inteligentes son el núcleo de la plataforma TokenEstate, proporcionando la lógica de negocio descentralizada que permite la tokenización y gestión de propiedades inmobiliarias. Están desarrollados en Solidity y siguen las mejores prácticas de seguridad y optimización.",3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center"},[c(Re,{class:"w-5 h-5 mr-2 text-indigo-500",[n]:{class:n}},3,"Hi_11"),"Estructura de Contratos"],1,null),e("div",null,{class:"grid md:grid-cols-2 gap-6 mb-6"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-blue-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"PropertyNFT.sol",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Contrato ERC721 para tokenización de propiedades inmobiliarias",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Registro de propiedades con metadatos",3,null),e("li",null,null,"Sistema de verificación de autenticidad",3,null),e("li",null,null,"Actualización controlada de metadatos",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-green-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[c(ft,{class:"w-4 h-4 mr-2",[n]:{class:n}},3,"Hi_12")," KNRT.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Token ERC20 utilizado para pagos en la plataforma",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Transferencias con permisos específicos",3,null),e("li",null,null,"Funciones de congelamiento para escrow",3,null),e("li",null,null,"Controles anti-inflación",3,null)],3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-yellow-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[c(vt,{class:"w-4 h-4 mr-2",[n]:{class:n}},3,"Hi_13")," Marketplace.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Facilita la compra/venta de PropertyNFTs",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Listado de propiedades con precios",3,null),e("li",null,null,"Funciones de oferta y contraoferta",3,null),e("li",null,null,"Comisiones configurables",3,null)],3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-purple-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[c(xt,{class:"w-4 h-4 mr-2",[n]:{class:n}},3,"Hi_14")," RentalManager.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Gestión de contratos de alquiler para propiedades",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Creación de acuerdos de arrendamiento",3,null),e("li",null,null,"Programación de pagos periódicos",3,null),e("li",null,null,"Gestión de disputas y terminación",3,null)],3,null)],1,null)],1,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center"},[c(Re,{class:"w-5 h-5 mr-2 text-indigo-500",[n]:{class:n}},3,"Hi_15"),"Ejemplo de Código: PropertyNFT.sol"],1,null),e("div",null,{class:"code-block"},[e("button",null,{class:"copy-button"},"Copiar",3,null),e("pre",null,null,`// SPDX-License-Identifier: MIT
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
}`,3,null)],3,null)],1,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Próximos Pasos para Despliegue",3,null),e("ol",null,{class:"list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2"},[e("li",null,null,"Despliegue de tokens ERC721 para representación de propiedades.",3,null),e("li",null,null,"Despliegue del token KNRT (ERC20) para pagos en la plataforma.",3,null),e("li",null,null,"Despliegue de contrato RentalEscrow para gestión de garantías.",3,null),e("li",null,null,"Despliegue de Marketplace para compra/venta de propiedades.",3,null),e("li",null,null,"Configuración de roles y permisos en cada contrato.",3,null),e("li",null,null,"Auditoría de seguridad completa antes del lanzamiento en mainnet.",3,null)],3,null)],3,null)],1,null)],1,null),e("section",null,{id:"security",class:"mb-12"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Seguridad y Auditoría",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"La seguridad es una prioridad crítica en la plataforma TokenEstate. Se implementan múltiples capas de seguridad y procesos de auditoría rigurosos para proteger los activos y datos de los usuarios.",3,null),e("div",null,{class:"grid md:grid-cols-2 gap-6 mb-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md"},[e("h3",null,{class:"text-xl font-semibold mb-3 text-gray-800 dark:text-white"},"Seguridad de Smart Contracts",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Auditorías por firmas especializadas",3,null),e("li",null,null,"Tests de penetración y análisis estático",3,null),e("li",null,null,"Control de acceso basado en roles",3,null),e("li",null,null,"Patrones de diseño seguros (Checks-Effects-Interactions)",3,null),e("li",null,null,"Implementación gradual con pausas de emergencia",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md"},[e("h3",null,{class:"text-xl font-semibold mb-3 text-gray-800 dark:text-white"},"Seguridad de Aplicación",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Autenticación multifactor",3,null),e("li",null,null,"Conexiones cifradas (HTTPS/TLS)",3,null),e("li",null,null,"Validación de entradas en frontend y backend",3,null),e("li",null,null,"Protección contra ataques comunes (XSS, CSRF)",3,null),e("li",null,null,"Monitoreo y alertas en tiempo real",3,null)],3,null)],3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Proceso de Auditoría",3,null),e("ol",null,{class:"list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2"},[e("li",null,null,[e("strong",null,null,"Auditoría Interna:",3,null)," Revisión de código por el equipo de desarrollo."],3,null),e("li",null,null,[e("strong",null,null,"Auditoría Comunitaria:",3,null)," Programa de recompensas para encontrar vulnerabilidades."],3,null),e("li",null,null,[e("strong",null,null,"Auditoría Profesional:",3,null)," Contratación de firmas especializadas en seguridad blockchain."],3,null),e("li",null,null,[e("strong",null,null,"Testnet Público:",3,null)," Despliegue en redes de prueba para validación amplia."],3,null),e("li",null,null,[e("strong",null,null,"Despliegue Mainnet:",3,null)," Lanzamiento progresivo con límites y monitoreo continuo."],3,null)],3,null)],3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Gestión de Riesgos",3,null),e("div",null,{class:"overflow-x-auto"},e("table",null,{class:"min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"},[e("thead",null,null,e("tr",null,{class:"bg-gray-50 dark:bg-gray-700 text-left"},[e("th",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200"},"Escenario",3,null),e("th",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200"},"Medidas de Mitigación",3,null)],3,null),3,null),e("tbody",null,null,[e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Impago de alquiler",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Garantías en escrow, ejecución automática por contrato",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Disputa contractual",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Sistema de resolución con árbitros designados",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Fallo en oráculo",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Múltiples fuentes de datos, mecanismo de fallback",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Vulnerabilidad en contrato",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Pausa de emergencia, actualizaciones por proxy",3,null)],3,null)],3,null)],3,null),3,null)],3,null)],3,null),e("section",null,{id:"timeline",class:"mb-12"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Cronograma y Estimación de Tiempos",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"El desarrollo e implementación de la plataforma TokenEstate seguirá un enfoque iterativo, con fases bien definidas y entregables específicos para cada etapa.",3,null),e("div",null,{class:"overflow-x-auto mb-8"},e("table",null,{class:"min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"},[e("thead",null,null,e("tr",null,{class:"bg-indigo-50 dark:bg-indigo-900/30"},[e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Fase",3,null),e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Actividades",3,null),e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Duración",3,null)],3,null),3,null),e("tbody",null,null,[e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"1. Diseño y Planificación",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Arquitectura, especificaciones técnicas, planificación de sprints",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"2 - 3 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"2. Desarrollo de Smart Contracts",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Implementación, pruebas unitarias, auditoría interna",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"8 - 12 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"3. Desarrollo Frontend/Backend",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Interfaz de usuario, API, integración Web3",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"4 - 6 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"4. Integración y Testing",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Pruebas de integración, testnet público",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"2 - 3 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"5. Auditoría de Seguridad",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Auditoría externa, correcciones, validación final",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"3 - 4 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"6. Despliegue y Launch",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Mainnet, monitoreo, lanzamiento público",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"1 semana",3,null)],3,null),e("tr",null,{class:"bg-indigo-50 dark:bg-indigo-900/20"},[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200"},"Total Estimado",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700"},null,3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200"},"20 - 29 semanas",3,null)],3,null)],3,null)],3,null),3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Hitos Clave",3,null),e("ul",null,{class:"list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"MVP en Testnet:",3,null)," Semana 14 - Funcionalidades básicas operativas"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Beta Pública:",3,null)," Semana 18 - Versión preliminar para testers seleccionados"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Auditoría Completa:",3,null)," Semana 24 - Finalización de auditorías de seguridad"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Launch en Mainnet:",3,null)," Semana 26-29 - Despliegue en red principal"],3,null)],3,null)],3,null)],3,null)],1,null),e("div",null,{class:d(u=>`tab-content ${u.value==="contracts"?"active":""}`,[l],'`tab-content ${p0.value==="contracts"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Contratos Inteligentes",3,null),3,null),e("div",null,{class:d(u=>`tab-content ${u.value==="security"?"active":""}`,[l],'`tab-content ${p0.value==="security"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Seguridad y Auditoría",3,null),3,null),e("div",null,{class:d(u=>`tab-content ${u.value==="implementation"?"active":""}`,[l],'`tab-content ${p0.value==="implementation"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Implementación y Despliegue",3,null),3,null),e("div",null,{class:"flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700"},[e("a",null,{href:"/about",class:"inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"},[e("svg",null,{class:"w-4 h-4 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M15 19l-7-7 7-7"},null,3,null),3,null),"Volver a la Información General"],3,null),e("a",null,{href:"/marketplace",class:"inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"},["Explorar Marketplace",e("svg",null,{class:"w-4 h-4 ml-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 5l7 7-7 7"},null,3,null),3,null)],3,null)],3,null)],1,null)],1,null)],1,"Hi_16")},is=N(g(ss,"s_IVLxFPyAapY")),cs=Object.freeze(Object.defineProperty({__proto__:null,_auto_BuildingIcon:xt,_auto_CodeIcon:Re,_auto_CreditCardIcon:ft,_auto_DatabaseIcon:yt,_auto_LockIcon:vt,default:is},Symbol.toStringTag,{value:"Module"})),wt=[{id:"contratos-laborales",title:"Contratos Laborales",description:"Plantillas para diferentes tipos de contratos laborales",icon:kl},{id:"despidos",title:"Cartas de Despido",description:"Documentos relacionados con la terminación de relaciones laborales",icon:ee},{id:"demandas",title:"Demandas Laborales",description:"Documentos para procesos judiciales laborales",icon:wl},{id:"reclamaciones",title:"Reclamaciones",description:"Documentos para reclamar derechos laborales e indemnizaciones",icon:ee}],kt=[{id:"afiliaciones",title:"Afiliaciones",description:"Documentos para gestionar la afiliación sindical",icon:kl},{id:"convenios",title:"Convenios Colectivos",description:"Documentos relacionados con convenios y pactos colectivos",icon:ee},{id:"conflictos",title:"Conflictos Laborales",description:"Documentos para la gestión de huelgas y conflictos",icon:wl},{id:"derechos",title:"Derechos Laborales",description:"Información y recursos sobre derechos de los trabajadores",icon:ee}],us=()=>{const t=Pe().value.isDespacho?wt:kt;return e("div",null,{class:"documentos-page"},[e("div",null,{class:"page-header"},[e("h1",null,{class:"page-title"},"Documentos Legales",3,null),e("p",null,{class:"page-description"},"Genera documentos legales personalizados para tus necesidades laborales",3,null)],3,null),e("div",null,{class:"options-section"},[e("div",null,{class:"option-card ai-assistant"},[e("div",null,{class:"option-icon"},c(fe,{class:"w-12 h-12 text-white",[n]:{class:n}},3,"w0_0"),1,null),e("div",null,{class:"option-content"},[e("h2",null,{class:"option-title"},"Asistente de IA",3,null),e("p",null,{class:"option-description"},"Genera documentos personalizados con la ayuda de nuestro asistente de inteligencia artificial. Ideal para documentos complejos o casos específicos.",3,null),c(I,{href:"/documentos-legales/asistente/",class:"option-btn",children:"Usar Asistente",[n]:{href:n,class:n}},3,"w0_1")],1,null)],1,null),e("div",null,{class:"option-card templates"},[e("div",null,{class:"option-icon"},c(ee,{class:"w-12 h-12 text-white",[n]:{class:n}},3,"w0_2"),1,null),e("div",null,{class:"option-content"},[e("h2",null,{class:"option-title"},"Plantillas Prediseñadas",3,null),e("p",null,{class:"option-description"},"Utiliza nuestras plantillas prediseñadas para generar documentos rápidamente. Solo completa los campos requeridos y obtén tu documento al instante.",3,null),e("div",null,{class:"categories-container"},[e("h3",null,{class:"categories-title"},"Elige una categoría:",3,null),e("div",null,{class:"categories-grid"},t.map(a=>c(I,{href:`/documentos-legales/generar/${a.id}/`,class:"category-card",children:[c(a.icon,{class:"w-6 h-6 category-icon",[n]:{class:n}},3,"w0_3"),e("div",null,{class:"category-info"},[e("h4",null,{class:"category-title"},O(a,"title"),1,null),e("p",null,{class:"category-description"},O(a,"description"),1,null)],1,null)],[n]:{class:n}},1,a.id)),1,null)],1,null)],1,null)],1,null),e("div",null,{class:"documents-history"},[e("h2",null,{class:"history-title"},"Mis Documentos Recientes",3,null),c(I,{href:"/documentos-legales/mis-documentos/",class:"history-link",children:"Ver todos mis documentos",[n]:{href:n,class:n}},3,"w0_4")],1,null)],1,null),e("style",null,null,`
        .documentos-page {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-description {
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .options-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .option-card {
          display: flex;
          background-color: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          width: 100px;
          flex-shrink: 0;
        }
        
        .ai-assistant .option-icon {
          background-color: #e53e3e;
        }
        
        .templates .option-icon {
          background-color: #3b82f6;
        }
        
        .option-content {
          padding: 2rem;
          flex-grow: 1;
        }
        
        .option-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        
        .option-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        
        .option-btn {
          display: inline-block;
          padding: 0.625rem 1.25rem;
          background-color: #e53e3e;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .option-btn:hover {
          background-color: #dc2626;
        }
        
        .categories-container {
          margin-top: 1.5rem;
        }
        
        .categories-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }
        
        .category-card {
          display: flex;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        
        .category-card:hover {
          border-color: #d1d5db;
          background-color: #f9fafb;
          transform: translateY(-2px);
        }
        
        .category-icon {
          margin-right: 0.75rem;
          color: #3b82f6;
          flex-shrink: 0;
        }
        
        .category-info {
          flex-grow: 1;
        }
        
        .category-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }
        
        .category-description {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .documents-history {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .history-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .history-link {
          color: #e53e3e;
          text-decoration: none;
          font-size: 0.875rem;
        }
        
        .history-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .option-card {
            flex-direction: column;
          }
          
          .option-icon {
            width: 100%;
            padding: 1.5rem;
          }
          
          .categories-grid {
            grid-template-columns: 1fr;
          }
        }
        `,3,null)],1,"w0_5")},ds=N(g(us,"s_54EgGtiLXHw")),gs=Object.freeze(Object.defineProperty({__proto__:null,_auto_categoriasDespacho:wt,_auto_categoriasSindicato:kt,default:ds},Symbol.toStringTag,{value:"Module"})),_t=["Andalucía","Aragón","Cantabria","Castilla La Mancha","Castilla y León","Cataluña","Comunidad de Madrid","Comunidad Valenciana","Extremadura","Galicia","Islas Baleares","Islas Canarias","La Rioja","Navarra","País Vasco","Principado de Asturias","Región de Murcia"],Et={Andalucía:["Almería","Cádiz","Córdoba","Granada","Huelva","Jaén","Málaga","Sevilla"],Aragón:["Huesca","Teruel","Zaragoza"],Cantabria:["Cantabria"],"Castilla La Mancha":["Albacete","Ciudad Real","Cuenca","Guadalajara","Toledo"],"Castilla y León":["Ávila","Burgos","León","Palencia","Salamanca","Segovia","Soria","Valladolid","Zamora"],Cataluña:["Barcelona","Girona","Lleida","Tarragona"],"Comunidad de Madrid":["Madrid"],"Comunidad Valenciana":["Alicante","Castellón","Valencia"],Extremadura:["Badajoz","Cáceres"],Galicia:["A Coruña","Lugo","Ourense","Pontevedra"],"Islas Baleares":["Baleares"],"Islas Canarias":["Las Palmas","Santa Cruz de Tenerife"],"La Rioja":["La Rioja"],Navarra:["Navarra"],"País Vasco":["Álava","Guipúzcoa","Vizcaya"],"Principado de Asturias":["Asturias"],"Región de Murcia":["Murcia"]},Tt=["Administrativo","Abogado","Arquitecto","Contable","Desarrollador","Diseñador","Enfermero","Médico","Profesor","Técnico"],St=["Indefinido","Temporal","Por obra o servicio","En prácticas","Formación"],Ct=["Sí","No"],At=["Completa","Parcial","Intensiva","Flexible"],It=["Administración y gestión","Agricultura","Comercio y marketing","Construcción","Educación","Hostelería y turismo","Informática y comunicaciones","Sanidad","Servicios socioculturales","Transporte y logística"],Rt=["Grupo 1: Ingenieros y Licenciados","Grupo 2: Ingenieros técnicos, Peritos","Grupo 3: Jefes administrativos","Grupo 4: Ayudantes no titulados","Grupo 5: Oficiales administrativos","Grupo 6: Subalternos","Grupo 7: Auxiliares administrativos"],Dt=R.object({community:R.string().min(1,"Por favor seleccione una comunidad"),province:R.string().min(1,"Por favor seleccione una provincia"),profession:R.string().min(1,"Por favor seleccione una profesión"),contractStartDate:R.string().min(1,"Por favor ingrese la fecha de inicio"),contractEndDate:R.string().optional(),contractType:R.string().min(1,"Por favor seleccione un tipo de contrato"),probationPeriod:R.string().min(1,"Por favor indique si hay periodo de prueba"),workScheduleType:R.string().min(1,"Por favor seleccione un tipo de jornada"),weeklyHours:R.string().optional(),netSalary:R.string().optional(),grossSalary:R.string().optional(),extraPayments:R.string().optional(),sector:R.string().optional(),contributionGroup:R.string().optional()}),Lt=l=>{var t,a,r;return{community:(l==null?void 0:l.community)||"",province:(l==null?void 0:l.province)||"",profession:(l==null?void 0:l.profession)||"",contractStartDate:(l==null?void 0:l.contract_start_date)||"",contractEndDate:(l==null?void 0:l.contract_end_date)||"",contractType:(l==null?void 0:l.contract_type)||"",probationPeriod:(l==null?void 0:l.probation_period)||"",workScheduleType:(l==null?void 0:l.work_schedule_type)||"",weeklyHours:((t=l==null?void 0:l.weekly_hours)==null?void 0:t.toString())||"",netSalary:((a=l==null?void 0:l.net_salary)==null?void 0:a.toString())||"",grossSalary:((r=l==null?void 0:l.gross_salary)==null?void 0:r.toString())||"",extraPayments:(l==null?void 0:l.extra_payments)||"",sector:(l==null?void 0:l.sector)||"",contributionGroup:(l==null?void 0:l.contribution_group)||""}},Nt=l=>({community:l.community,province:l.province,profession:l.profession,contract_start_date:l.contractStartDate,contract_end_date:l.contractEndDate||null,contract_type:l.contractType,probation_period:l.probationPeriod,work_schedule_type:l.workScheduleType,weekly_hours:l.weeklyHours?parseInt(l.weeklyHours):null,net_salary:l.netSalary?parseFloat(l.netSalary):null,gross_salary:l.grossSalary?parseFloat(l.grossSalary):null,extra_payments:l.extraPayments||null,sector:l.sector||null,contribution_group:l.contributionGroup||null}),ps=async l=>{if(l.cacheControl({maxAge:0,staleWhileRevalidate:0,noStore:!0}),!await me(l))throw l.redirect(302,"/auth");const a=X(l);if(!a)return{community:"",province:"",profession:"",contractStartDate:"",contractEndDate:"",contractType:"",probationPeriod:"",workScheduleType:"",weeklyHours:"",netSalary:"",grossSalary:"",extraPayments:"",sector:"",contributionGroup:""};const r=P(l);try{const o=await r.execute({sql:"SELECT * FROM contract_details WHERE user_id = ?",args:[a]});return o.rows.length>0?Lt(o.rows[0]):{community:"",province:"",profession:"",contractStartDate:"",contractEndDate:"",contractType:"",probationPeriod:"",workScheduleType:"",weeklyHours:"",netSalary:"",grossSalary:"",extraPayments:"",sector:"",contributionGroup:""}}catch(o){return console.error("[CONTRACT-LOAD] Error loading contract data:",o),{community:"",province:"",profession:"",contractStartDate:"",contractEndDate:"",contractType:"",probationPeriod:"",workScheduleType:"",weeklyHours:"",netSalary:"",grossSalary:"",extraPayments:"",sector:"",contributionGroup:""}}},Mt=H(g(ps,"s_ol0LkfVFN1o")),ms=async(l,t)=>{const a=X(t);if(!a)throw t.redirect(302,"/auth");const r=P(t);try{const o=await r.execute({sql:"SELECT id FROM contract_details WHERE user_id = ?",args:[a]}),s=Nt(l);if(o.rows.length>0){const i=o.rows[0].id;await r.execute({sql:`UPDATE contract_details SET
            community = ?,
            province = ?,
            profession = ?,
            contract_start_date = ?,
            contract_end_date = ?,
            contract_type = ?,
            probation_period = ?,
            work_schedule_type = ?,
            weekly_hours = ?,
            net_salary = ?,
            gross_salary = ?,
            extra_payments = ?,
            sector = ?,
            contribution_group = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?`,args:[s.community,s.province,s.profession,s.contract_start_date,s.contract_end_date,s.contract_type,s.probation_period,s.work_schedule_type,s.weekly_hours,s.net_salary,s.gross_salary,s.extra_payments,s.sector,s.contribution_group,i,a]})}else await r.execute({sql:`INSERT INTO contract_details (
            user_id, community, province, profession, contract_start_date, 
            contract_end_date, contract_type, probation_period, work_schedule_type, 
            weekly_hours, net_salary, gross_salary, extra_payments, sector, contribution_group
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,args:[a,s.community,s.province,s.profession,s.contract_start_date,s.contract_end_date,s.contract_type,s.probation_period,s.work_schedule_type,s.weekly_hours,s.net_salary,s.gross_salary,s.extra_payments,s.sector,s.contribution_group]});return{status:"success",message:"Datos del contrato guardados correctamente"}}catch(o){return console.error("[CONTRACT-SAVE] Error saving contract data:",o),{status:"error",message:o instanceof Error?o.message:"Error saving contract data"}}},Ot=Y(g(ms,"s_ciapiCcKhho"),pe(g(Dt,"s_bkcP8YWk1RM"))),bs=async l=>{const[t]=A(),r=l.target.value;t.value=r;const o=document.getElementById("province");o&&(o.value="")},hs=()=>{var o,s,i,u,p,b,m,x,y,_,S,T,v,h,w,M,j;const l=Mt(),t=Ot(),a=E(l.value.community),r=g(bs,"s_yfWV0AUD06E",[a]);return e("div",null,{class:"container mx-auto py-8 px-4"},e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"},[e("h1",null,{class:"text-2xl font-bold text-gray-900 dark:text-white mb-6"},"Datos de tu Contrato Laboral",3,null),((o=t.value)==null?void 0:o.status)==="success"&&e("div",null,{class:"mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300"},d(f=>f.value.message,[t],"p0.value.message"),3,"d3_0"),((s=t.value)==null?void 0:s.status)==="error"&&e("div",null,{class:"mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300"},d(f=>f.value.message,[t],"p0.value.message"),3,"d3_1"),c(V,{action:t,class:"space-y-6",children:[e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,null,[e("label",null,{for:"community",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Comunidad Autónoma",3,null),e("select",null,{id:"community",name:"community",value:d((f,Q)=>Q.value||f.value.community,[l,a],"p1.value||p0.value.community"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",onChange$:r},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.community,[l],"!p0.value.community")},"Seleccione una comunidad",3,null),_t.map(f=>e("option",{value:f},null,f,1,f))],1,null),((u=(i=t.value)==null?void 0:i.fieldErrors)==null?void 0:u.community)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},d(f=>f.value.fieldErrors.community,[t],"p0.value.fieldErrors.community"),3,"d3_2")],1,null),e("div",null,null,[e("label",null,{for:"province",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Provincia",3,null),e("select",null,{id:"province",name:"province",value:d(f=>f.value.province,[l],"p0.value.province"),disabled:d(f=>!f.value,[a],"!p0.value"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.province,[l],"!p0.value.province")},a.value?"Seleccione una provincia":"Primero seleccione una comunidad",1,null),a.value&&((p=Et[a.value])==null?void 0:p.map(f=>e("option",{value:f},null,f,1,f)))],1,null),((m=(b=t.value)==null?void 0:b.fieldErrors)==null?void 0:m.province)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},d(f=>f.value.fieldErrors.province,[t],"p0.value.fieldErrors.province"),3,"d3_3")],1,null),e("div",null,null,[e("label",null,{for:"profession",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Profesión",3,null),e("select",null,{id:"profession",name:"profession",value:d(f=>f.value.profession,[l],"p0.value.profession"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.profession,[l],"!p0.value.profession")},"Seleccione una profesión",3,null),Tt.map(f=>e("option",{value:f},null,f,1,f))],1,null),((y=(x=t.value)==null?void 0:x.fieldErrors)==null?void 0:y.profession)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},d(f=>f.value.fieldErrors.profession,[t],"p0.value.fieldErrors.profession"),3,"d3_4")],1,null),e("div",null,null,[e("label",null,{for:"contractStartDate",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de inicio del contrato",3,null),e("input",null,{id:"contractStartDate",name:"contractStartDate",type:"date",value:d(f=>f.value.contractStartDate,[l],"p0.value.contractStartDate"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null),((S=(_=t.value)==null?void 0:_.fieldErrors)==null?void 0:S.contractStartDate)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},d(f=>f.value.fieldErrors.contractStartDate,[t],"p0.value.fieldErrors.contractStartDate"),3,"d3_5")],1,null),e("div",null,null,[e("label",null,{for:"contractEndDate",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de finalización del contrato",3,null),e("input",null,{id:"contractEndDate",name:"contractEndDate",type:"date",value:d(f=>f.value.contractEndDate,[l],"p0.value.contractEndDate"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"Dejar en blanco para contratos indefinidos",3,null)],3,null),e("div",null,null,[e("label",null,{for:"contractType",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Tipo de contrato",3,null),e("select",null,{id:"contractType",name:"contractType",value:d(f=>f.value.contractType,[l],"p0.value.contractType"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.contractType,[l],"!p0.value.contractType")},"Seleccione tipo de contrato",3,null),St.map(f=>e("option",{value:f},null,f,1,f))],1,null),((v=(T=t.value)==null?void 0:T.fieldErrors)==null?void 0:v.contractType)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},d(f=>f.value.fieldErrors.contractType,[t],"p0.value.fieldErrors.contractType"),3,"d3_6")],1,null),e("div",null,null,[e("label",null,{for:"probationPeriod",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Periodo de prueba",3,null),e("select",null,{id:"probationPeriod",name:"probationPeriod",value:d(f=>f.value.probationPeriod,[l],"p0.value.probationPeriod"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.probationPeriod,[l],"!p0.value.probationPeriod")},"¿Tiene periodo de prueba?",3,null),Ct.map(f=>e("option",{value:f},null,f,1,f))],1,null),((w=(h=t.value)==null?void 0:h.fieldErrors)==null?void 0:w.probationPeriod)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},d(f=>f.value.fieldErrors.probationPeriod,[t],"p0.value.fieldErrors.probationPeriod"),3,"d3_7")],1,null),e("div",null,null,[e("label",null,{for:"workScheduleType",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Tipo de jornada",3,null),e("select",null,{id:"workScheduleType",name:"workScheduleType",value:d(f=>f.value.workScheduleType,[l],"p0.value.workScheduleType"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.workScheduleType,[l],"!p0.value.workScheduleType")},"Seleccione tipo de jornada",3,null),At.map(f=>e("option",{value:f},null,f,1,f))],1,null),((j=(M=t.value)==null?void 0:M.fieldErrors)==null?void 0:j.workScheduleType)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},d(f=>f.value.fieldErrors.workScheduleType,[t],"p0.value.fieldErrors.workScheduleType"),3,"d3_8")],1,null),e("div",null,null,[e("label",null,{for:"weeklyHours",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Horas semanales",3,null),e("input",null,{id:"weeklyHours",name:"weeklyHours",type:"number",min:"1",max:"60",value:d(f=>f.value.weeklyHours,[l],"p0.value.weeklyHours"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"netSalary",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Salario Neto",3,null),e("div",null,{class:"relative"},[e("input",null,{id:"netSalary",name:"netSalary",type:"number",step:"0.01",min:"0",value:d(f=>f.value.netSalary,[l],"p0.value.netSalary"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-7"},null,3,null),e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},e("span",null,{class:"text-gray-500"},"€",3,null),3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"grossSalary",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Salario Bruto",3,null),e("div",null,{class:"relative"},[e("input",null,{id:"grossSalary",name:"grossSalary",type:"number",step:"0.01",min:"0",value:d(f=>f.value.grossSalary,[l],"p0.value.grossSalary"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-7"},null,3,null),e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},e("span",null,{class:"text-gray-500"},"€",3,null),3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"extraPayments",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Pagas Extras",3,null),e("input",null,{id:"extraPayments",name:"extraPayments",type:"text",value:d(f=>f.value.extraPayments,[l],"p0.value.extraPayments"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"sector",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Sector / Sindicato",3,null),e("select",null,{id:"sector",name:"sector",value:d(f=>f.value.sector,[l],"p0.value.sector"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.sector,[l],"!p0.value.sector")},"Seleccione un sector",3,null),It.map(f=>e("option",{value:f},null,f,1,f))],1,null)],1,null),e("div",null,null,[e("label",null,{for:"contributionGroup",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Grupo de Cotización",3,null),e("select",null,{id:"contributionGroup",name:"contributionGroup",value:d(f=>f.value.contributionGroup,[l],"p0.value.contributionGroup"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:d(f=>!f.value.contributionGroup,[l],"!p0.value.contributionGroup")},"Seleccione grupo de cotización",3,null),Rt.map(f=>e("option",{value:f},null,f,1,f))],1,null)],1,null)],1,null),e("div",null,{class:"flex justify-end mt-8"},e("button",null,{type:"submit",class:"py-3 px-8 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"},[c(je,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"d3_9"),e("span",null,null,"Guardar Cambios",3,null)],1,null),1,null)],[n]:{action:n,class:n}},1,"d3_10")],1,null),1,"d3_11")},fs=N(g(hs,"s_mx2B29bX000")),xs=Object.freeze(Object.defineProperty({__proto__:null,_auto_communities:_t,_auto_contractFormSchema:Dt,_auto_contractTypes:St,_auto_contributionGroups:Rt,_auto_mapDBToFormFields:Lt,_auto_mapFormToDatabaseFields:Nt,_auto_probationOptions:Ct,_auto_professions:Tt,_auto_provincesByRegion:Et,_auto_sectors:It,_auto_workScheduleTypes:At,default:fs,useContractAction:Ot,useContractData:Mt},Symbol.toStringTag,{value:"Module"})),vs=async l=>{const t=X(l);if(!t)return{timesheet:[],isCheckedIn:!1,currentEntry:null};const a=P(l);try{const r=await a.execute({sql:`SELECT * FROM user_timesheet 
            WHERE user_id = ? AND check_out_time IS NULL 
            ORDER BY check_in_time DESC LIMIT 1`,args:[t]}),o=r.rows.length>0,s=o?r.rows[0]:null;return{timesheet:(await a.execute({sql:`SELECT * FROM user_timesheet 
            WHERE user_id = ? 
            ORDER BY check_in_time DESC LIMIT 10`,args:[t]})).rows,isCheckedIn:o,currentEntry:s}}catch(r){return console.error("[Timesheet Loader] Error:",r),{timesheet:[],isCheckedIn:!1,currentEntry:null}}},jt=H(g(vs,"s_kV5Mi7j0weM")),ys=async(l,t)=>{const a=X(t);if(!a)return{success:!1,message:"Usuario no identificado. Por favor inicia sesión nuevamente."};const{latitude:r,longitude:o}=l,s=r&&o?JSON.stringify({latitude:r,longitude:o}):null,i=P(t);try{return(await i.execute({sql:`SELECT id FROM user_timesheet 
            WHERE user_id = ? AND check_out_time IS NULL`,args:[a]})).rows.length>0?{success:!1,message:"Ya tienes una entrada activa. Debes fichar salida primero."}:(await i.execute({sql:`INSERT INTO user_timesheet 
            (user_id, check_in_time, check_in_location) 
            VALUES (?, CURRENT_TIMESTAMP, ?)`,args:[a,s]}),{success:!0,message:"Entrada fichada correctamente",timestamp:new Date().toISOString()})}catch(u){return console.error("[Check-In Action] Error:",u),{success:!1,message:"Error al fichar entrada"}}},Pt=Y(g(ys,"s_2KEilzizEdE")),ws=async(l,t)=>{const a=X(t);if(!a)return{success:!1,message:"Usuario no identificado"};const{latitude:r,longitude:o}=l,s=r&&o?JSON.stringify({latitude:r,longitude:o}):null,i=P(t);try{const u=await i.execute({sql:`SELECT id, check_in_time FROM user_timesheet 
            WHERE user_id = ? AND check_out_time IS NULL 
            ORDER BY check_in_time DESC LIMIT 1`,args:[a]});if(u.rows.length===0)return{success:!1,message:"No tienes una entrada activa para fichar salida."};const p=u.rows[0].id,b=String(u.rows[0].check_in_time),m=new Date(b),x=new Date,y=Math.round((x.getTime()-m.getTime())/6e4);return await i.execute({sql:`UPDATE user_timesheet 
            SET check_out_time = CURRENT_TIMESTAMP, 
                check_out_location = ?, 
                total_minutes = ? 
            WHERE id = ?`,args:[s,y,p]}),{success:!0,message:"Salida fichada correctamente",timestamp:x.toISOString(),totalMinutes:y}}catch(u){return console.error("[Check-Out Action] Error:",u),{success:!1,message:"Error al fichar salida"}}},Ut=Y(g(ws,"s_8vTpSx2690k")),ks=l=>{const t=new Date(l),r=new Date().getTime()-t.getTime(),o=Math.floor(r/36e5),s=Math.floor(r%36e5/6e4),i=Math.floor(r%6e4/1e3);return`${o.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`},_s=l=>{const t=Math.floor(l/60),a=l%60;return`${t.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}`},Es=l=>new Date(l).toLocaleString(),Ts=()=>{const[l]=A();l.value=!0},Ss=(l,t)=>{const[a]=A();l.target&&l.target.tagName==="BUTTON"&&(a.value=!0)},Cs=()=>{const[l]=A();l.value=!0},As=(l,t)=>{const[a]=A();l.target&&l.target.tagName==="BUTTON"&&(a.value=!0)},Is=()=>{var y,_,S,T;G();const l=jt(),t=Pt(),a=Ut(),r=E(new Date().toLocaleTimeString()),o=E(null),s=E(null),i=E("00:00:00"),u=E(!1),p=E(!1),b=g(ks,"s_xWmZ6JyQ62k"),m=g(_s,"s_ejpsFxqJ24o"),x=g(Es,"s_p08jFcGimIk");return U(k("s_VjgIvF9uEqw",[r,i,b,l])),U(k("s_hTp6ngvHQmg",[t,a,u,p])),U(k("s_LtC4P2Ki0ww",[o,s])),e("div",null,{class:"grid grid-cols-1 md:grid-cols-3 gap-6"},[e("div",null,{class:"md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6"},[e("div",null,{class:"flex items-center justify-between mb-6"},[e("div",null,{class:"flex items-center"},[c(Be,{class:"w-8 h-8 text-red-500 mr-3",[n]:{class:n}},3,"kT_0"),e("h2",null,{class:"text-2xl font-bold text-gray-800 dark:text-white"},"Fichaje actual",3,null)],1,null),e("div",null,{class:"text-3xl font-mono font-bold text-gray-800 dark:text-white"},d(v=>v.value,[r],"p0.value"),3,null)],1,null),e("div",null,{class:"mb-6"},[e("div",null,{class:"flex items-center mb-2"},[c(ze,{class:"w-5 h-5 text-gray-500 mr-2",[n]:{class:n}},3,"kT_1"),e("span",null,{class:"text-gray-700 dark:text-gray-300"},"Estado de la ubicación:",3,null)],1,null),s.value?e("div",null,{class:"flex items-center text-red-500"},[c($e,{class:"w-5 h-5 mr-2",[n]:{class:n}},3,"kT_2"),e("span",null,null,d(v=>v.value,[s],"p0.value"),3,null)],1,"kT_3"):o.value?e("div",null,{class:"text-green-500 dark:text-green-400"},["Ubicación capturada correctamente",e("div",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},["Lat: ",o.value.latitude.toFixed(6),", Lng: ",o.value.longitude.toFixed(6)],1,null)],1,"kT_4"):e("div",null,{class:"text-yellow-500 dark:text-yellow-400"},"Obteniendo ubicación...",3,null)],1,null),e("div",null,{class:d(v=>`border rounded-lg p-6 mb-6 ${v.value.isCheckedIn?"border-green-500 bg-green-50 dark:bg-green-900/20":"border-gray-200 dark:border-gray-700"}`,[l],'`border rounded-lg p-6 mb-6 ${p0.value.isCheckedIn?"border-green-500 bg-green-50 dark:bg-green-900/20":"border-gray-200 dark:border-gray-700"}`')},l.value.isCheckedIn?e("div",null,null,[e("div",null,{class:"flex items-center justify-between mb-4"},[e("h3",null,{class:"text-xl font-semibold text-green-700 dark:text-green-400"},"¡Estás trabajando ahora!",3,null),e("span",null,{class:"text-3xl font-mono font-bold text-green-700 dark:text-green-400"},d(v=>v.value,[i],"p0.value"),3,null)],3,null),e("div",null,{class:"mb-4"},[e("span",null,{class:"block text-sm text-gray-600 dark:text-gray-400"},"Inicio de jornada:",3,null),e("span",null,{class:"font-medium text-gray-800 dark:text-white"},l.value.currentEntry?e("span",null,null,x(String(l.value.currentEntry.check_in_time)),1,"kT_5"):"",1,null)],1,null),c(V,{action:a,onSubmit$:g(Ts,"s_vWbzTFmFL0c",[p]),onClick$:g(Ss,"s_vDz2Pib5GPA",[p]),children:[e("input",null,{type:"hidden",name:"latitude",value:d(v=>{var h;return(h=v.value)==null?void 0:h.latitude},[o],"p0.value?.latitude")},null,3,null),e("input",null,{type:"hidden",name:"longitude",value:d(v=>{var h;return(h=v.value)==null?void 0:h.longitude},[o],"p0.value?.longitude")},null,3,null),e("button",null,{type:"submit",class:"w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-6 rounded-xl transition-colors flex items-center justify-center text-2xl shadow-lg border-4 border-red-500",disabled:d((v,h)=>!h.value||v.value,[p,o],"!p1.value||p0.value"),onClick$:k("s_Fk4Yqt0pXCY",[p,o])},p.value?c(B,{children:[c(he,{class:"w-8 h-8 mr-3 animate-spin",[n]:{class:n}},3,"kT_6"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"PROCESANDO...",3,null)]},1,"kT_7"):c(B,{children:[c(rl,{class:"w-8 h-8 mr-3",[n]:{class:n}},3,"kT_8"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"DETENER JORNADA",3,null)]},1,"kT_9"),1,null),((y=a.value)==null?void 0:y.success)===!1&&e("div",null,{class:"mt-3 text-red-500 text-sm"},d(v=>v.value.message,[a],"p0.value.message"),3,"kT_10")],[n]:{action:n,onSubmit$:n,onClick$:n}},1,"kT_11")],1,"kT_12"):e("div",null,null,[e("div",null,{class:"flex items-center justify-between mb-4"},e("h3",null,{class:"text-xl font-semibold text-green-700 dark:text-green-400"},"Listo para comenzar",3,null),3,null),e("div",null,{class:"text-center py-4"},[e("div",null,{class:"mb-4 text-gray-700 dark:text-gray-300 font-medium text-center"},"Pulsa el botón verde para comenzar tu jornada laboral",3,null),c(V,{action:t,onSubmit$:g(Cs,"s_ZSPbGcu09LQ",[u]),onClick$:g(As,"s_vVZsbSym0ig",[u]),children:[e("input",null,{type:"hidden",name:"latitude",value:d(v=>{var h;return(h=v.value)==null?void 0:h.latitude},[o],"p0.value?.latitude")},null,3,null),e("input",null,{type:"hidden",name:"longitude",value:d(v=>{var h;return(h=v.value)==null?void 0:h.longitude},[o],"p0.value?.longitude")},null,3,null),e("button",null,{type:"submit",class:"w-full bg-green-600 hover:bg-green-500 text-white font-bold py-6 px-6 rounded-xl transition-colors flex items-center justify-center text-2xl shadow-lg border-4 border-green-500",disabled:d((v,h)=>!h.value||v.value,[u,o],"!p1.value||p0.value"),onClick$:k("s_2V3nd5UvheU",[u,o])},u.value?c(B,{children:[c(he,{class:"w-8 h-8 mr-3 animate-spin",[n]:{class:n}},3,"kT_13"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"PROCESANDO...",3,null)]},1,"kT_14"):c(B,{children:[c(Ve,{class:"w-8 h-8 mr-3",[n]:{class:n}},3,"kT_15"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"INICIAR JORNADA",3,null)]},1,"kT_16"),1,null)],[n]:{action:n,onSubmit$:n,onClick$:n}},1,"kT_17"),o.value&&e("div",null,{class:"mt-6 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md"},[e("div",null,{class:"bg-gray-100 p-2 text-sm text-gray-700 font-medium"},[c(ze,{class:"w-4 h-4 inline mr-1",[n]:{class:n}},3,"kT_18"),"Tu ubicación actual"],1,null),e("div",null,{class:"h-[250px] w-full"},c(ro,{get latitude(){return o.value.latitude},get longitude(){return o.value.longitude},[n]:{latitude:d(v=>v.value.latitude,[o],"p0.value.latitude"),longitude:d(v=>v.value.longitude,[o],"p0.value.longitude")}},3,"kT_19"),1,null)],1,"kT_20"),o.value?e("div",null,{class:"mt-5 text-center animate-pulse"},e("span",null,{class:"text-base text-green-600 font-semibold"},"👆 ¡Pulsa el botón VERDE para comenzar!",3,null),3,null):e("div",null,{class:"mt-6 text-yellow-600 text-center py-3 border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md"},[c($e,{class:"w-6 h-6 inline mr-1",[n]:{class:n}},3,"kT_21"),e("span",null,{class:"font-medium"},"Esperando ubicación para habilitar el fichaje...",3,null),e("div",null,{class:"text-sm mt-1"},"Por favor, permite el acceso a tu ubicación en el navegador",3,null)],1,"kT_22"),((_=t.value)==null?void 0:_.success)===!1&&e("div",null,{class:"mt-4 text-red-500 text-base p-3 bg-red-50 border border-red-200 rounded-lg"},[c($e,{class:"w-5 h-5 inline mr-1",[n]:{class:n}},3,"kT_23"),d(v=>v.value.message,[t],"p0.value.message")],1,"kT_24")],1,null)],1,null),1,null),((S=t.value)==null?void 0:S.success)&&e("div",null,{class:"bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"},d(v=>v.value.message,[t],"p0.value.message"),3,"kT_25"),((T=a.value)==null?void 0:T.success)&&e("div",null,{class:"bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"},[e("p",null,null,d(v=>v.value.message,[a],"p0.value.message"),3,null),a.value.totalMinutes!==void 0&&e("p",null,{class:"text-sm mt-1"},["Tiempo trabajado: ",e("span",null,null,m(a.value.totalMinutes),1,null)," horas"],1,"kT_26")],1,"kT_27")],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-6"},[e("div",null,{class:"flex items-center mb-4"},[c(bn,{class:"w-6 h-6 text-red-500 mr-2",[n]:{class:n}},3,"kT_28"),e("h2",null,{class:"text-xl font-bold text-gray-800 dark:text-white"},"Historial reciente",3,null)],1,null),l.value.timesheet.length===0?e("div",null,{class:"text-gray-500 dark:text-gray-400 text-center py-10"},"No hay registros de fichaje.",3,"kT_29"):e("div",null,{class:"space-y-4"},l.value.timesheet.map(v=>G(e("div",null,{class:"border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"},[e("div",null,{class:"font-medium text-gray-800 dark:text-white"},new Date(String(v.check_in_time)).toLocaleDateString(),1,null),e("div",null,{class:"grid grid-cols-2 text-sm mt-1"},[e("div",null,{class:"text-gray-600 dark:text-gray-400"},[c(Ve,{class:"w-4 h-4 inline mr-1 text-green-500",[n]:{class:n}},3,"kT_30"),new Date(String(v.check_in_time)).toLocaleTimeString()],1,null),e("div",null,{class:"text-gray-600 dark:text-gray-400"},v.check_out_time?c(B,{children:[c(rl,{class:"w-4 h-4 inline mr-1 text-red-500",[n]:{class:n}},3,"kT_31"),new Date(String(v.check_out_time)).toLocaleTimeString()]},1,"kT_32"):e("span",null,{class:"text-green-500"},"En curso",3,null),1,null)],1,null),v.total_minutes!==null&&e("div",null,{class:"mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400"},[c(yn,{class:"w-4 h-4 mr-1",[n]:{class:n}},3,"kT_33"),e("span",null,null,["Total: ",e("span",null,null,m(v.total_minutes),1,null)],1,null)],1,"kT_34"),v.check_in_location&&e("button",{onClick$:k("s_8KhE9BOzE7I",[v,o])},{class:"mt-2 text-xs text-blue-600 hover:underline flex items-center"},[c(ze,{class:"w-3 h-3 mr-1",[n]:{class:n}},3,"kT_35"),"Ver ubicación de entrada"],0,"kT_36")],1,v.id))),1,null)],1,null)],1,"kT_37")},Rs=N(g(Is,"s_wenwFk5169g")),Ds=Object.freeze(Object.defineProperty({__proto__:null,default:Rs,useCheckInAction:Pt,useCheckOutAction:Ut,useTimesheetLoader:jt},Symbol.toStringTag,{value:"Module"})),Ls=[],Ns=()=>tn,sl=()=>sn,Ee=()=>pn,Te=()=>Xn,F=()=>ua,Ms=()=>ma,Os=[["/",[F,()=>xa],"/",["q-2185f5fb.js","q-317babe6.js"]],["auth/logout/",[F,sl,()=>Ea],"/auth/logout/",["q-2185f5fb.js","q-cc8eafc9.js","q-b0b7ff6a.js"]],["capacitacion/crear/",[F,Ee,()=>Ra],"/capacitacion/crear/",["q-2185f5fb.js","q-ffcb994d.js","q-8dc02f40.js"]],["documentos-legales/asistente/",[F,Te,()=>Ha],"/documentos-legales/asistente/",["q-2185f5fb.js","q-4a6b39ae.js","q-6e2b1218.js"]],["documentos-legales/mis-documentos/",[F,Te,()=>Xa],"/documentos-legales/mis-documentos/",["q-2185f5fb.js","q-4a6b39ae.js","q-28989a64.js"]],["capacitacion/curso/[id]/modulos/crear/",[F,Ee,()=>ar],"/capacitacion/curso/[id]/modulos/crear/",["q-2185f5fb.js","q-ffcb994d.js","q-bd679c24.js"]],["capacitacion/curso/[id]/editar/",[F,Ee,()=>dr],"/capacitacion/curso/[id]/editar/",["q-2185f5fb.js","q-ffcb994d.js","q-04c1c984.js"]],["capacitacion/curso/[id]/",[F,Ee,()=>br],"/capacitacion/curso/[id]/",["q-2185f5fb.js","q-ffcb994d.js","q-6a17eb39.js"]],["documentos-legales/generar/[categoria]/",[F,Te,()=>xr],"/documentos-legales/generar/[categoria]/",["q-2185f5fb.js","q-4a6b39ae.js","q-5f8df57f.js"]],["documentos-legales/pdf/[id]/",[F,Te,()=>Er],"/documentos-legales/pdf/[id]/",["q-2185f5fb.js","q-4a6b39ae.js","q-08f4c26c.js"]],["about/",[F,()=>Ir],"/about/",["q-2185f5fb.js","q-05a70ae8.js"]],["absences/",[F,Ns,()=>zr],"/absences/",["q-2185f5fb.js","q-af373af2.js","q-0e5a84ba.js"]],["auth/",[F,sl,()=>eo],"/auth/",["q-2185f5fb.js","q-cc8eafc9.js","q-79170fbe.js"]],["basic-map/",[F,()=>io],"/basic-map/",["q-2185f5fb.js","q-593cd924.js"]],["capacitacion/",[F,Ee,()=>mo],"/capacitacion/",["q-2185f5fb.js","q-ffcb994d.js","q-6acf5978.js"]],["chat/",[F,()=>Zo],"/chat/",["q-2185f5fb.js","q-2ade8b1a.js"]],["docs/",[F,()=>cs],"/docs/",["q-2185f5fb.js","q-d998b155.js"]],["documentos-legales/",[F,Te,()=>gs],"/documentos-legales/",["q-2185f5fb.js","q-4a6b39ae.js","q-1b0ff1b9.js"]],["profile/",[F,()=>xs],"/profile/",["q-2185f5fb.js","q-1d48cb81.js"]],["timesheet/",[F,Ms,()=>Ds],"/timesheet/",["q-2185f5fb.js","q-7a7652f2.js","q-74df4780.js"]]],js=[],Ps=!0,Us="/",$s=!0,Js={routes:Os,serverPlugins:Ls,menus:js,trailingSlash:Ps,basePathname:Us,cacheModules:$s};export{Us as basePathname,$s as cacheModules,Js as default,js as menus,Os as routes,Ls as serverPlugins,Ps as trailingSlash};
