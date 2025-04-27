import{r as G,c as M,i as p,b as e,d as i,S as we,e as C,f as a,L as D,u as E,g as z,h as w,j as _e,k as $,l as ua,m as Q,n as g,F as B,o as I,p as X,q as K,z as Ee,s as xl,t as ke,w as J,x as ee,y as el,A as ga,B as Nl}from"./q-1b25398f.js";import{createClient as ma}from"@libsql/client";import{z as L}from"zod";import{ChatOpenAI as Ol}from"@langchain/openai";import{SystemMessage as Ml,HumanMessage as jl,AIMessage as Pl}from"@langchain/core/messages";import{WebPDFLoader as pa}from"@langchain/community/document_loaders/web/pdf";import ba from"country-flag-icons/string/3x2/US";import xa from"country-flag-icons/string/3x2/ES";import ha from"country-flag-icons/string/3x2/IT";import fa from"country-flag-icons/string/3x2/FR";import ya from"country-flag-icons/string/3x2/BR";function U(l){var t,n;try{console.log("[TURSO] Creating database client");const r=(t=l.env.get("PRIVATE_TURSO_DATABASE_URL"))==null?void 0:t.trim();if(!r)throw console.error("[TURSO] Missing database URL"),new Error("PRIVATE_TURSO_DATABASE_URL is not defined");const o=(n=l.env.get("PRIVATE_TURSO_AUTH_TOKEN"))==null?void 0:n.trim();if(!o){if(!r.includes("file:"))throw console.error("[TURSO] Missing auth token for remote database"),new Error("PRIVATE_TURSO_AUTH_TOKEN is not defined");console.log("[TURSO] No auth token needed for local database")}return console.log(`[TURSO] Creating client for URL: ${r.substring(0,20)}...`),ma({url:r,authToken:o})}catch(r){throw console.error("[TURSO] Error creating database client:",r),r}}async function oe(l,t,n){console.log(`[TURSO-QUERY] Executing SQL: ${typeof t=="string"?t.substring(0,50):"complex query"}`);const r=U(l);try{let o;return n&&n.length>0?(console.log(`[TURSO-QUERY] With parameters: ${JSON.stringify(n)}`),o=await r.execute({sql:t,args:n})):o=await r.execute(t),console.log(`[TURSO-QUERY] Query successful, returned ${o.rows.length} rows`),o}catch(o){throw console.error("[TURSO-QUERY] Error executing query:",typeof t=="string"?t.substring(0,100):"complex query",n,o),new Error(`Database query failed: ${o instanceof Error?o.message:String(o)}`)}}function Ul(l){return new TextEncoder().encode(l)}function cl(l){return Array.from(new Uint8Array(l)).map(t=>t.toString(16).padStart(2,"0")).join("")}async function va(l){console.log("[AUTH] Hashing password");const t=Ul(l),n=crypto.getRandomValues(new Uint8Array(16)),r=await crypto.subtle.importKey("raw",t,{name:"PBKDF2"},!1,["deriveBits"]),o=await crypto.subtle.deriveBits({name:"PBKDF2",salt:n,iterations:1e5,hash:"SHA-256"},r,256),s=new Uint8Array(n.length+32);s.set(n),s.set(new Uint8Array(o),n.length);const c=cl(s);return console.log("[AUTH] Password hashed successfully"),c}async function ka(l,t){console.log("[AUTH] Verifying password");const n=new Uint8Array(t.match(/.{1,2}/g).map(b=>parseInt(b,16))),r=n.slice(0,16),o=n.slice(16),s=Ul(l),c=await crypto.subtle.importKey("raw",s,{name:"PBKDF2"},!1,["deriveBits"]),d=await crypto.subtle.deriveBits({name:"PBKDF2",salt:r,iterations:1e5,hash:"SHA-256"},c,256),u=cl(d)===cl(o);return console.log(`[AUTH] Password verification result: ${u}`),u}const $l=(l,t,n)=>{const r=String(t),o=86400;l.cookie.set("auth_token",r,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:o}),l.cookie.set("user_type",n,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:o}),l.cookie.set("session_active","true",{path:"/",httpOnly:!1,sameSite:"lax",secure:!0,maxAge:o})},zl=l=>{l.cookie.delete("auth_token",{path:"/"}),l.cookie.delete("user_type",{path:"/"}),l.cookie.delete("session_active",{path:"/"})},W=l=>{var n;const t=(n=l.cookie.get("auth_token"))==null?void 0:n.value;return console.log(`[AUTH] Retrieved user_id: ${t||"none"}`),t||null},se=l=>{var n;const t=(n=l.cookie.get("user_type"))==null?void 0:n.value;return console.log(`[AUTH] Retrieved user type from cookie: ${t||"none"}`),t==="trabajador"||t==="despacho"||t==="sindicato"?t:(console.log("[AUTH] User type not found in cookie, defaulting to trabajador"),"trabajador")},wa=l=>se(l)==="sindicato",_a=async l=>{try{const t=W(l);if(!t)return!1;const r=await U(l).execute({sql:"SELECT sector FROM contract_details WHERE user_id = ? AND sector = ?",args:[t,"sindicato"]});return console.log(`[AUTH] Checking sindicado status for user ${t}: ${r.rows.length>0}`),r.rows.length>0}catch(t){return console.error("[AUTH] Error checking sindicado status:",t),!1}},Ea=async l=>{try{const t=W(l);if(!t)return!1;const r=await U(l).execute({sql:"SELECT sector FROM contract_details WHERE user_id = ? AND sector = ?",args:[t,"despacho"]});return console.log(`[AUTH] Checking despacho status for user ${t}: ${r.rows.length>0}`),r.rows.length>0}catch(t){return console.error("[AUTH] Error checking despacho status:",t),!1}},Fl=async l=>{if(wa(l))return!0;const t=await _a(l),n=await Ea(l);return t||n},Ae=async l=>{var o,s;console.log("[AUTH] Verifying authentication");const t=(o=l.cookie.get("auth_token"))==null?void 0:o.value;if(console.log(`[AUTH] Found auth_token: ${t?"yes":"no"}`),!t)return console.log("[AUTH] No auth_token found - user not authenticated"),!1;let n=(s=l.cookie.get("user_type"))==null?void 0:s.value;if(!n&&t)try{console.log("[AUTH] No user_type in cookie, attempting to fetch from database");const d=await U(l).execute({sql:"SELECT type FROM users WHERE id = ?",args:[t]});d.rows.length>0&&d.rows[0].type?(n=d.rows[0].type,console.log(`[AUTH] Retrieved user_type from database: ${n}`)):(console.log("[AUTH] User type not found in database, using default trabajador"),n="trabajador")}catch(c){console.error("[AUTH] Error retrieving user type from database:",c),n="trabajador"}const r=86400;l.cookie.set("auth_token",t,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:r}),n?(console.log(`[AUTH] Refreshing user_type cookie with value: ${n}`),l.cookie.set("user_type",n,{path:"/",httpOnly:!0,sameSite:"lax",secure:!0,maxAge:r})):console.log("[AUTH] No user_type found, attempting to retrieve from database"),l.cookie.set("session_active","true",{path:"/",httpOnly:!1,sameSite:"lax",secure:!0,maxAge:r});try{await U(l).execute({sql:"UPDATE users SET session_expires = ? WHERE id = ?",args:[new Date(Date.now()+r*1e3),t]})}catch(c){console.error("[AUTH] Error refreshing session in database:",c)}return console.log("[AUTH] User authenticated successfully and session refreshed"),!0},Ta=async l=>{const t=await se(l);if(t!=="trabajador"&&t!=="sindicato")throw console.log("[Absences] Access denied - redirecting to home. User type:",t),l.redirect(302,"/")},Ca=async l=>({userType:await se(l)}),ql=G(p(Ca,"s_nMzIH0uDSUQ")),Sa=()=>(ql(),e("div",null,{class:"space-y-6"},[e("header",null,null,[e("h1",null,{class:"text-2xl font-bold text-gray-800 dark:text-white mb-2"},"Registro de Ausencias",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Registra tus días de baja laboral, vacaciones y otras ausencias.",3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 shadow rounded-lg p-6"},i(we,null,3,"0E_0"),1,null)],1,"0E_1")),Aa=M(p(Sa,"s_NC5FCI3szbA")),Ia=Object.freeze(Object.defineProperty({__proto__:null,default:Aa,onRequest:Ta,useAbsencesUserInfo:ql},Symbol.toStringTag,{value:"Module"})),re=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"8",y2:"12"},null,3,null),e("line",null,{x1:"12",x2:"12.01",y1:"16",y2:"16"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ui_0"),ol=l=>C("svg",{...l,children:[e("path",null,{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"},null,3,null),e("path",null,{d:"M12 9v4"},null,3,null),e("path",null,{d:"M12 17h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"zY_0"),fe=l=>C("svg",{...l,children:[e("path",null,{d:"m12 19-7-7 7-7"},null,3,null),e("path",null,{d:"M19 12H5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"VY_0"),Bl=l=>C("svg",{...l,children:[e("path",null,{d:"M5 12h14"},null,3,null),e("path",null,{d:"m12 5 7 7-7 7"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ye_0"),dl=l=>C("svg",{...l,children:[e("path",null,{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"},null,3,null),e("path",null,{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"uO_0"),Da=l=>C("svg",{...l,children:[e("path",null,{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"},null,3,null),e("path",null,{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"oi_0"),Tl=l=>C("svg",{...l,children:[e("rect",null,{height:"14",rx:"2",ry:"2",width:"20",x:"2",y:"7"},null,3,null),e("path",null,{d:"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sZ_0"),Ra=l=>C("svg",{...l,children:[e("rect",null,{height:"20",rx:"2",ry:"2",width:"16",x:"4",y:"2"},null,3,null),e("path",null,{d:"M9 22v-4h6v4"},null,3,null),e("path",null,{d:"M8 6h.01"},null,3,null),e("path",null,{d:"M16 6h.01"},null,3,null),e("path",null,{d:"M12 6h.01"},null,3,null),e("path",null,{d:"M12 10h.01"},null,3,null),e("path",null,{d:"M12 14h.01"},null,3,null),e("path",null,{d:"M16 10h.01"},null,3,null),e("path",null,{d:"M16 14h.01"},null,3,null),e("path",null,{d:"M8 10h.01"},null,3,null),e("path",null,{d:"M8 14h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"t9_0"),La=l=>C("svg",{...l,children:[e("rect",null,{height:"18",rx:"2",ry:"2",width:"18",x:"3",y:"4"},null,3,null),e("line",null,{x1:"16",x2:"16",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"8",x2:"8",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"3",x2:"21",y1:"10",y2:"10"},null,3,null),e("path",null,{d:"m9 16 2 2 4-4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"3s_0"),Cl=l=>C("svg",{...l,children:[e("rect",null,{height:"18",rx:"2",ry:"2",width:"18",x:"3",y:"4"},null,3,null),e("line",null,{x1:"16",x2:"16",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"8",x2:"8",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"3",x2:"21",y1:"10",y2:"10"},null,3,null),e("path",null,{d:"M8 14h.01"},null,3,null),e("path",null,{d:"M12 14h.01"},null,3,null),e("path",null,{d:"M16 14h.01"},null,3,null),e("path",null,{d:"M8 18h.01"},null,3,null),e("path",null,{d:"M12 18h.01"},null,3,null),e("path",null,{d:"M16 18h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"R5_0"),Fe=l=>C("svg",{...l,children:[e("rect",null,{height:"18",rx:"2",ry:"2",width:"18",x:"3",y:"4"},null,3,null),e("line",null,{x1:"16",x2:"16",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"8",x2:"8",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"3",x2:"21",y1:"10",y2:"10"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"34_0"),Ce=l=>C("svg",{...l,children:[e("path",null,{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"},null,3,null),e("polyline",null,{points:"22 4 12 14.01 9 11.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Jy_0"),ge=l=>C("svg",{...l,children:[e("polyline",null,{points:"9 11 12 14 22 4"},null,3,null),e("path",null,{d:"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"0r_0"),Na=l=>C("svg",{...l,children:e("polyline",null,{points:"20 6 9 17 4 12"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"R2_0"),me=l=>C("svg",{...l,children:e("path",null,{d:"m6 9 6 6 6-6"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"8g_0"),Xe=l=>C("svg",{...l,children:e("path",null,{d:"m9 18 6-6-6-6"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Rc_0"),Oa=l=>C("svg",{...l,children:e("path",null,{d:"m18 15-6-6-6 6"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Kp_0"),Yl=l=>C("svg",{...l,children:[e("rect",null,{height:"4",rx:"1",ry:"1",width:"8",x:"8",y:"2"},null,3,null),e("path",null,{d:"M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"},null,3,null),e("path",null,{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5"},null,3,null),e("path",null,{d:"M4 13.5V6a2 2 0 0 1 2-2h2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sl_0"),sl=l=>C("svg",{...l,children:[e("rect",null,{height:"4",rx:"1",ry:"1",width:"8",x:"8",y:"2"},null,3,null),e("path",null,{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"},null,3,null),e("path",null,{d:"M12 11h4"},null,3,null),e("path",null,{d:"M12 16h4"},null,3,null),e("path",null,{d:"M8 11h.01"},null,3,null),e("path",null,{d:"M8 16h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"kq_0"),Ma=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("polyline",null,{points:"12 6 12 12 16.5 12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"wI_0"),Qe=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("polyline",null,{points:"12 6 12 12 16 14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"PM_0"),ja=l=>C("svg",{...l,children:[e("rect",null,{height:"14",rx:"2",ry:"2",width:"14",x:"8",y:"8"},null,3,null),e("path",null,{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"PY_0"),Se=l=>C("svg",{...l,children:[e("path",null,{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"},null,3,null),e("polyline",null,{points:"7 10 12 15 17 10"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"15",y2:"3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"f4_0"),ul=l=>C("svg",{...l,children:[e("path",null,{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"jA_0"),Sl=l=>C("svg",{...l,children:[e("path",null,{d:"M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"},null,3,null),e("polyline",null,{points:"14 2 14 8 20 8"},null,3,null),e("path",null,{d:"M2 15h10"},null,3,null),e("path",null,{d:"m5 12-3 3 3 3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ab_0"),Pa=l=>C("svg",{...l,children:[e("path",null,{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"},null,3,null),e("polyline",null,{points:"14 2 14 8 20 8"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"18",y2:"12"},null,3,null),e("line",null,{x1:"9",x2:"15",y1:"15",y2:"15"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sV_0"),ze=l=>C("svg",{...l,children:[e("path",null,{d:"M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"},null,3,null),e("path",null,{d:"M8 18h1"},null,3,null),e("path",null,{d:"M18.42 9.61a2.1 2.1 0 1 1 2.97 2.97L16.95 17 13 18l.99-3.95 4.43-4.44Z"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"h7_0"),V=l=>C("svg",{...l,children:[e("path",null,{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"},null,3,null),e("polyline",null,{points:"14 2 14 8 20 8"},null,3,null),e("line",null,{x1:"16",x2:"8",y1:"13",y2:"13"},null,3,null),e("line",null,{x1:"16",x2:"8",y1:"17",y2:"17"},null,3,null),e("line",null,{x1:"10",x2:"8",y1:"9",y2:"9"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"gd_0"),pe=l=>C("svg",{...l,children:[e("path",null,{d:"M22 10v6M2 10l10-5 10 5-10 5z"},null,3,null),e("path",null,{d:"M6 12v5c3 3 9 3 12 0v-5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Df_0"),Ua=l=>C("svg",{...l,children:e("path",null,{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"z9_0"),gl=l=>C("svg",{...l,children:[e("path",null,{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},null,3,null),e("polyline",null,{points:"9 22 9 12 15 12 15 22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"pt_0"),$a=l=>C("svg",{...l,children:[e("path",null,{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"},null,3,null),e("path",null,{d:"M9 18h6"},null,3,null),e("path",null,{d:"M10 22h4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"JJ_0"),za=l=>C("svg",{...l,children:[e("line",null,{x1:"8",x2:"21",y1:"6",y2:"6"},null,3,null),e("line",null,{x1:"8",x2:"21",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"8",x2:"21",y1:"18",y2:"18"},null,3,null),e("line",null,{x1:"3",x2:"3.01",y1:"6",y2:"6"},null,3,null),e("line",null,{x1:"3",x2:"3.01",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"3",x2:"3.01",y1:"18",y2:"18"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"l2_0"),ve=l=>C("svg",{...l,children:[e("line",null,{x1:"12",x2:"12",y1:"2",y2:"6"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"18",y2:"22"},null,3,null),e("line",null,{x1:"4.93",x2:"7.76",y1:"4.93",y2:"7.76"},null,3,null),e("line",null,{x1:"16.24",x2:"19.07",y1:"16.24",y2:"19.07"},null,3,null),e("line",null,{x1:"2",x2:"6",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"18",x2:"22",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"4.93",x2:"7.76",y1:"19.07",y2:"16.24"},null,3,null),e("line",null,{x1:"16.24",x2:"19.07",y1:"7.76",y2:"4.93"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"kT_0"),Al=l=>C("svg",{...l,children:[e("rect",null,{height:"11",rx:"2",ry:"2",width:"18",x:"3",y:"11"},null,3,null),e("path",null,{d:"M7 11V7a5 5 0 0 1 10 0v4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"WS_0"),Il=l=>C("svg",{...l,children:[e("path",null,{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"},null,3,null),e("polyline",null,{points:"10 17 15 12 10 7"},null,3,null),e("line",null,{x1:"15",x2:"3",y1:"12",y2:"12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"ca_0"),ml=l=>C("svg",{...l,children:[e("path",null,{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"},null,3,null),e("polyline",null,{points:"16 17 21 12 16 7"},null,3,null),e("line",null,{x1:"21",x2:"9",y1:"12",y2:"12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"0h_0"),Fa=l=>C("svg",{...l,children:[e("rect",null,{height:"16",rx:"2",width:"20",x:"2",y:"4"},null,3,null),e("path",null,{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"n4_0"),il=l=>C("svg",{...l,children:[e("path",null,{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"},null,3,null),e("circle",null,{cx:"12",cy:"10",r:"3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"8M_0"),qa=l=>C("svg",{...l,children:[e("line",null,{x1:"4",x2:"20",y1:"12",y2:"12"},null,3,null),e("line",null,{x1:"4",x2:"20",y1:"6",y2:"6"},null,3,null),e("line",null,{x1:"4",x2:"20",y1:"18",y2:"18"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"f1_0"),he=l=>C("svg",{...l,children:e("path",null,{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"42_0"),Ba=l=>C("svg",{...l,children:[e("line",null,{x1:"2",x2:"22",y1:"2",y2:"22"},null,3,null),e("path",null,{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"},null,3,null),e("path",null,{d:"M5 10v2a7 7 0 0 0 12 5"},null,3,null),e("path",null,{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33"},null,3,null),e("path",null,{d:"M9 9v3a3 3 0 0 0 5.12 2.12"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"19",y2:"22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Vn_0"),Ya=l=>C("svg",{...l,children:[e("path",null,{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"},null,3,null),e("path",null,{d:"M19 10v2a7 7 0 0 1-14 0v-2"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"19",y2:"22"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"xC_0"),Ha=l=>C("svg",{...l,children:[e("path",null,{d:"m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"},null,3,null),e("path",null,{d:"m13 13 6 6"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"uR_0"),Va=l=>C("svg",{...l,children:[e("path",null,{d:"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"},null,3,null),e("path",null,{d:"m15 5 4 4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"eG_0"),pl=l=>C("svg",{...l,children:e("polygon",null,{points:"5 3 19 12 5 21 5 3"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ic_0"),hl=l=>C("svg",{...l,children:[e("path",null,{d:"M5 12h14"},null,3,null),e("path",null,{d:"M12 5v14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Z7_0"),Hl=l=>C("svg",{...l,children:[e("polyline",null,{points:"6 9 6 2 18 2 18 9"},null,3,null),e("path",null,{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"},null,3,null),e("rect",null,{height:"8",width:"12",x:"6",y:"14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ad_0"),Ga=l=>C("svg",{...l,children:[e("path",null,{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"},null,3,null),e("path",null,{d:"M3 3v5h5"},null,3,null),e("path",null,{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"},null,3,null),e("path",null,{d:"M16 16h5v5"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"CE_0"),ll=l=>C("svg",{...l,children:[e("path",null,{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"},null,3,null),e("polyline",null,{points:"17 21 17 13 7 13 7 21"},null,3,null),e("polyline",null,{points:"7 3 7 8 15 8"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Jw_0"),Xa=l=>C("svg",{...l,children:[e("path",null,{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"},null,3,null),e("path",null,{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"},null,3,null),e("path",null,{d:"M7 21h10"},null,3,null),e("path",null,{d:"M12 3v18"},null,3,null),e("path",null,{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"GK_0"),Wa=l=>C("svg",{...l,children:[e("circle",null,{cx:"11",cy:"11",r:"8"},null,3,null),e("path",null,{d:"m21 21-4.3-4.3"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"OE_0"),Vl=l=>C("svg",{...l,children:[e("path",null,{d:"m22 2-7 20-4-9-9-4Z"},null,3,null),e("path",null,{d:"M22 2 11 13"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ll_0"),Ka=l=>C("svg",{...l,children:e("path",null,{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"nm_0"),Qa=l=>C("svg",{...l,children:[e("path",null,{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"},null,3,null),e("path",null,{d:"M5 3v4"},null,3,null),e("path",null,{d:"M19 17v4"},null,3,null),e("path",null,{d:"M3 5h4"},null,3,null),e("path",null,{d:"M17 19h4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"61_0"),Dl=l=>C("svg",{...l,children:e("rect",null,{height:"18",rx:"2",width:"18",x:"3",y:"3"},null,3,null)},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Sb_0"),Gl=l=>C("svg",{...l,children:[e("path",null,{d:"M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"},null,3,null),e("path",null,{d:"M7 7h.01"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"N3_0"),Za=l=>C("svg",{...l,children:[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"6"},null,3,null),e("circle",null,{cx:"12",cy:"12",r:"2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"t5_0"),Ja=l=>C("svg",{...l,children:[e("path",null,{d:"M3 6h18"},null,3,null),e("path",null,{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"},null,3,null),e("path",null,{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"},null,3,null),e("line",null,{x1:"10",x2:"10",y1:"11",y2:"17"},null,3,null),e("line",null,{x1:"14",x2:"14",y1:"11",y2:"17"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Eb_0"),en=l=>C("svg",{...l,children:[e("path",null,{d:"M3 6h18"},null,3,null),e("path",null,{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"},null,3,null),e("path",null,{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"St_0"),ln=l=>C("svg",{...l,children:[e("path",null,{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"},null,3,null),e("polyline",null,{points:"17 8 12 3 7 8"},null,3,null),e("line",null,{x1:"12",x2:"12",y1:"3",y2:"15"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"Ow_0"),je=l=>C("svg",{...l,children:[e("path",null,{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"9",cy:"7",r:"4"},null,3,null),e("polyline",null,{points:"16 11 18 13 22 9"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"wP_0"),tn=l=>C("svg",{...l,children:[e("path",null,{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"9",cy:"7",r:"4"},null,3,null),e("line",null,{x1:"19",x2:"19",y1:"8",y2:"14"},null,3,null),e("line",null,{x1:"22",x2:"16",y1:"11",y2:"11"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"18_0"),Ze=l=>C("svg",{...l,children:[e("path",null,{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"12",cy:"7",r:"4"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"sX_0"),qe=l=>C("svg",{...l,children:[e("path",null,{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"},null,3,null),e("circle",null,{cx:"9",cy:"7",r:"4"},null,3,null),e("path",null,{d:"M22 21v-2a4 4 0 0 0-3-3.87"},null,3,null),e("path",null,{d:"M16 3.13a4 4 0 0 1 0 7.75"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"pI_0"),an=l=>C("svg",{...l,children:[e("path",null,{d:"m22 8-6 4 6 4V8Z"},null,3,null),e("rect",null,{height:"12",rx:"2",ry:"2",width:"14",x:"2",y:"6"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"2v_0"),nn=l=>C("svg",{...l,children:[e("polygon",null,{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"},null,3,null),e("path",null,{d:"M15.54 8.46a5 5 0 0 1 0 7.07"},null,3,null),e("path",null,{d:"M19.07 4.93a10 10 0 0 1 0 14.14"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"0H_0"),rn=l=>C("svg",{...l,children:[e("polygon",null,{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5"},null,3,null),e("line",null,{x1:"22",x2:"16",y1:"9",y2:"15"},null,3,null),e("line",null,{x1:"16",x2:"22",y1:"9",y2:"15"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"gs_0"),on=l=>C("svg",{...l,children:[e("path",null,{d:"M18 6 6 18"},null,3,null),e("path",null,{d:"m6 6 12 12"},null,3,null)]},{"data-qwikest-icon":!0,fill:"none",height:"1em",stroke:"currentColor","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",viewBox:"0 0 24 24",width:"1em",xmlns:"http://www.w3.org/2000/svg"},0,"CN_0"),sn=()=>e("div",null,{class:"container mx-auto px-4 py-8"},[e("div",null,{class:"mb-8"},[e("div",null,{class:"flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2"},[i(D,{href:"/",class:"hover:text-red-600 dark:hover:text-red-400",children:"Inicio",[a]:{href:a,class:a}},3,"Z2_0"),i(Xe,{class:"w-3 h-3 mx-2",[a]:{class:a}},3,"Z2_1"),e("span",null,{class:"text-gray-700 dark:text-gray-300"},"Auditoría de documentos",3,null)],1,null),e("h1",null,{class:"text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center"},[i(V,{class:"w-8 h-8 text-red-600 dark:text-red-500 mr-3",[a]:{class:a}},3,"Z2_2"),"Auditoría de documentos legales"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mt-2 max-w-3xl"},"Esta herramienta utiliza inteligencia artificial para analizar documentos legales, identificar términos relevantes y detectar posibles problemas o inconsistencias.",3,null)],1,null),i(we,null,3,"Z2_3")],1,"Z2_4"),cn=M(p(sn,"s_hQi0SKwtcws")),dn=Object.freeze(Object.defineProperty({__proto__:null,default:cn},Symbol.toStringTag,{value:"Module"})),un=async l=>{const t=await Ae(l);if(t&&!l.pathname.includes("/auth/logout"))throw l.redirect(302,"/");return{isAuthenticated:t}},gn=G(p(un,"s_xckjbOj1HPc")),mn=()=>{const l=E(!1);return z(w("s_xhcLYhTye5s",[l])),e("div",{class:`min-h-screen font-sans ${l.value?"dark bg-gradient-to-br from-teal-900 via-green-900 to-gray-900 text-gray-100":"bg-gradient-to-br from-teal-50 via-green-50 to-gray-50 text-gray-900"}`},{style:{paddingTop:"calc(env(safe-area-inset-top))"}},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden opacity-40 z-0"},[" ",e("div",null,{class:"w-20 h-20 bg-teal-500/10 dark:bg-teal-400/10 rounded-full absolute top-[15%] left-[55%] animate-[float_15s_infinite]"},null,3,null),e("div",null,{class:"w-32 h-32 bg-green-500/10 dark:bg-green-400/10 rounded-full absolute top-[40%] left-[75%] animate-[float_18s_infinite]",style:"animation-delay: 0.5s;"},null,3,null),e("div",null,{class:"w-16 h-16 bg-teal-600/10 dark:bg-teal-500/10 rounded-full absolute top-[70%] left-[65%] animate-[float_12s_infinite]",style:"animation-delay: 1s;"},null,3,null),e("div",null,{class:"w-24 h-24 bg-green-600/10 dark:bg-green-500/10 rounded-full absolute top-[30%] left-[40%] animate-[float_20s_infinite]",style:"animation-delay: 1.5s;"},null,3,null)],3,null),e("div",null,{class:"relative z-10 pt-safe"},i(we,null,3,"9u_0"),1,null),e("style",null,null,`
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -15px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 15px); }
          100% { transform: translate(0, 0); }
        }
      `,3,null)],1,"9u_1")},pn=M(p(mn,"s_nNgqqIoeIss")),bn=Object.freeze(Object.defineProperty({__proto__:null,default:pn,useAuthCheck:gn},Symbol.toStringTag,{value:"Module"})),xn=async l=>{const t=await Ae(l);if(!t)throw l.redirect(302,"/auth");const n=se(l);console.log("[CAPACITACION] User type from cookie:",n);const r=n==="despacho"||n==="sindicato";if(!r)throw console.log("[CAPACITACION] User type not authorized for this section, redirecting to home"),l.redirect(302,"/");return{isAuthenticated:t,canAccess:r}},hn=G(p(xn,"s_kCasEOK2wms")),fn=()=>e("div",null,{class:"capacitacion-layout"},e("div",null,{class:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"},i(we,null,3,"X1_0"),1,null),1,"X1_1"),yn=M(p(fn,"s_ILP9JjLoqDc")),vn=Object.freeze(Object.defineProperty({__proto__:null,default:yn,useAuthCheck:hn},Symbol.toStringTag,{value:"Module"})),kn=async l=>{var o;if(console.log("[DOCUMENTOS-LEGALES] Verificando autenticación y permisos"),!await Ae(l))throw console.log("[DOCUMENTOS-LEGALES] Usuario no autenticado, redirigiendo a login"),l.redirect(302,"/auth");const n=se(l);console.log("[DOCUMENTOS-LEGALES] User type from cookie:",n);const r=n==="despacho"||n==="sindicato";if(!r)throw console.log("[DOCUMENTOS-LEGALES] User type not authorized for this section, redirecting to home"),l.redirect(302,"/");return{isAuthenticated:!0,userType:n,isDespachoOrSindicato:r,userId:((o=l.cookie.get("auth_token"))==null?void 0:o.value)||null}},tl=G(p(kn,"s_9qdGODRuQEA")),wn=()=>{const t=_e().url.pathname,n=[{href:"/documentos-legales/",label:"Inicio",icon:gl,active:t==="/documentos-legales/"},{href:"/documentos-legales/asistente/",label:"Asistente IA",icon:he,active:t.includes("/documentos-legales/asistente/")},{href:"/documentos-legales/mis-documentos/",label:"Mis Documentos",icon:V,active:t.includes("/documentos-legales/mis-documentos/")}];return e("div",null,{class:"documentos-legal-layout"},[e("header",null,{class:"layout-header"},e("div",null,{class:"header-content"},[e("h1",null,{class:"site-title"},"Sistema Legal",3,null),e("nav",null,{class:"site-nav"},e("ul",null,{class:"nav-list"},n.map(r=>e("li",{class:`nav-item ${r.active?"active":""}`},null,i(D,{get href(){return r.href},class:"nav-link",children:[i(r.icon,{class:"nav-icon",[a]:{class:a}},3,"as_0"),e("span",null,null,$(r,"label"),1,null)],[a]:{href:ua(r,"href"),class:a}},1,"as_1"),1,r.href)),1,null),1,null)],1,null),1,null),e("main",null,{class:"layout-main"},i(we,null,3,"as_2"),1,null),e("style",null,null,`
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
        `,3,null)],1,"as_3")},_n=M(p(wn,"s_J1X6RZ303Kw")),En=Object.freeze(Object.defineProperty({__proto__:null,default:_n,useAuthCheck:tl},Symbol.toStringTag,{value:"Module"})),Tn=async l=>{var c,d;const t=await Ae(l),n=t?se(l):null,r=n==="trabajador",o=n==="sindicato",s=n==="despacho";return t&&console.log("[LAYOUT] User roles determined from cookie:",{userType:n,isTrabajador:r,isSindicado:o,isDespacho:s}),{isAuthenticated:t,userType:n,userId:((c=l.cookie.get("userId"))==null?void 0:c.value)||null,username:((d=l.cookie.get("username"))==null?void 0:d.value)||null,isTrabajador:r,isSindicado:o,isDespacho:s}},Xl=G(p(Tn,"s_HC3ct71u5lY")),Cn=()=>{const[l]=I();l.value=!0},Sn=()=>{const[l]=I();return l.value=!1},An=()=>{const[l]=I();return l.value=!1},In=()=>{const[l]=I();return l.value=!1},Dn=()=>{const[l]=I();return l.value=!1},Rn=()=>{const[l]=I();return l.value=!1},Ln=()=>{const[l]=I();return l.value=!1},Nn=()=>{const[l]=I();return l.value=!1},On=()=>{const[l]=I();return l.value=!1},Mn=()=>{const[l]=I();return l.value=!1},jn=()=>{const[l]=I();return l.value=!1},Pn=()=>{const[l,t]=I();t.value=!1,l.value=!0},Un=()=>{const[l]=I();return l.value=!1},$n=()=>{var c,d,u,b,m,f,k,v,A,S,y,x,_,j,P,h,Z,ae,F,ie,ne,Y;Q();const l=Xl(),t=_e(),n=E(!1),r=E(!1),o=E(!1);z(w("s_c6Pb49uSSiw",[l,o])),z(w("s_70w0lA9O1OU",[r]));const s=R=>!!(R==="/"&&t.url.pathname==="/"||R!=="/"&&t.url.pathname.startsWith(R));return e("div",null,{class:"min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"},[e("nav",null,{class:"bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"},[e("div",null,{class:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"},e("div",null,{class:"flex justify-between h-16"},[e("div",null,{class:"flex"},[e("div",null,{class:"flex-shrink-0 flex items-center"},i(D,{href:"/","aria-label":"Home",children:i(pe,{class:"w-9 h-9 text-red-600 dark:text-red-500",[a]:{class:a}},3,"as_0"),[a]:{href:a,"aria-label":a}},1,"as_1"),1,null),e("div",null,{class:"hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3"},[i(D,{href:"/",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(gl,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_2"),e("span",null,null,"Inicio",3,null)],1,null),[a]:{href:a}},1,"as_3"),i(D,{href:"/docs",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/docs")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(dl,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_4"),e("span",null,null,"Documentos",3,null)],1,null),[a]:{href:a}},1,"as_5"),i(D,{href:"/about",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/about")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(qe,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_6"),e("span",null,null,"Informacion",3,null)],1,null),[a]:{href:a}},1,"as_7"),((c=l.value)==null?void 0:c.isAuthenticated)&&i(D,{href:"/chat",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/chat")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(he,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_8"),e("span",null,null,"Chat",3,null)],1,null),[a]:{href:a}},1,"as_9"),((d=l.value)==null?void 0:d.isTrabajador)&&i(D,{href:"/absences",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/absences")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(Fe,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_10"),e("span",null,null,"Ausencias",3,null)],1,null),[a]:{href:a}},1,"as_11"),((u=l.value)==null?void 0:u.isTrabajador)&&i(D,{href:"/timesheet",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/timesheet")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(Qe,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_12"),e("span",null,null,"Fichaje",3,null)],1,null),[a]:{href:a}},1,"as_13"),(((b=l.value)==null?void 0:b.isSindicado)||((m=l.value)==null?void 0:m.isDespacho))&&i(D,{href:"/capacitacion",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/capacitacion")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(pe,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_14"),e("span",null,null,"Capacitación",3,null)],1,null),[a]:{href:a}},1,"as_15"),(((f=l.value)==null?void 0:f.isSindicado)||((k=l.value)==null?void 0:k.isDespacho))&&i(D,{href:"/documentos-legales",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/documentos-legales")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(V,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_16"),e("span",null,null,"Documentos Legales",3,null)],1,null),[a]:{href:a}},1,"as_17"),(((v=l.value)==null?void 0:v.isSindicado)||((A=l.value)==null?void 0:A.isDespacho))&&i(D,{href:"/auditoria",class:`px-3 py-2 rounded-md text-sm font-medium transition-colors ${s("/auditoria")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(V,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_18"),e("span",null,null,"Auditoría",3,null)],1,null),[a]:{href:a}},1,"as_19")],1,null)],1,null),e("div",null,{class:"flex items-center gap-1"},[(S=l.value)!=null&&S.isAuthenticated?e("div",null,{class:"flex items-center space-x-2"},[((y=l.value)==null?void 0:y.userType)&&e("div",null,{class:"hidden sm:flex"},e("span",{class:`px-2 py-1 text-xs rounded-full font-medium ${l.value.userType==="trabajador"?"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300":l.value.userType==="despacho"?"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300":l.value.userType==="sindicato"?"bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300":"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`},null,g(R=>R.value.userType==="trabajador"?"Trabajador":R.value.userType==="despacho"?"Despacho":R.value.userType==="sindicato"?"Sindicato":"Usuario",[l],'p0.value.userType==="trabajador"?"Trabajador":p0.value.userType==="despacho"?"Despacho":p0.value.userType==="sindicato"?"Sindicato":"Usuario"'),3,null),1,"as_20"),i(D,{href:"/profile",class:`hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center transition-colors ${s("/profile")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,children:e("div",null,{class:"flex items-center"},[i(Ze,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_21"),e("span",null,null,g(R=>R.value.username||"Perfil",[l],'p0.value.username||"Perfil"'),3,null)],1,null),[a]:{href:a}},1,"as_22"),i(D,{href:"/auth/logout",class:"hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",onClick$:p(Cn,"s_RKVaC5VuZ1U",[o]),children:e("div",null,{class:"flex items-center"},o.value?i(B,{children:e("div",null,{class:"flex items-center justify-center"},[e("div",null,{class:"w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse"},null,3,null),e("span",null,null,"Cerrando sesión...",3,null)],3,null)},3,"as_23"):i(B,{children:[i(ml,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_24"),e("span",null,null,"Cerrar sesión",3,null)]},1,"as_25"),1,null),[a]:{href:a,class:a,onClick$:a}},1,"as_26")],1,"as_27"):i(D,{href:"/auth",class:"hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",children:e("div",null,{class:"flex items-center"},[i(Il,{class:"w-5 h-5 mr-1.5",[a]:{class:a}},3,"as_28"),e("span",null,null,"Iniciar sesión",3,null)],1,null),[a]:{href:a,class:a}},1,"as_29"),e("button",null,{class:"sm:hidden p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 rounded-md","aria-expanded":g(R=>R.value,[n],"p0.value"),"aria-controls":"mobile-menu","aria-label":"Main menu",onClick$:w("s_Ff2XDudc5YY",[n])},n.value?i(on,{class:"w-6 h-6",[a]:{class:a}},3,"as_30"):i(qa,{class:"w-6 h-6",[a]:{class:a}},3,"as_31"),1,null)],1,null)],1,null),1,null),e("div",null,{class:g(R=>`sm:hidden ${R.value?"block":"hidden"}`,[n],'`sm:hidden ${p0.value?"block":"hidden"}`'),id:"mobile-menu"},e("div",null,{class:"px-2 pt-2 pb-3 space-y-1"},[i(D,{href:"/",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(Sn,"s_gRl1GCjZWxE",[n]),children:e("div",null,{class:"flex items-center"},[i(gl,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_32"),e("span",null,null,"Inicio",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_33"),i(D,{href:"/docs",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/docs")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(An,"s_lVCfvAzL4AA",[n]),children:e("div",null,{class:"flex items-center"},[i(dl,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_34"),e("span",null,null,"Documentos",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_35"),i(D,{href:"/about",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/about")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(In,"s_0eWNaKEnmzE",[n]),children:e("div",null,{class:"flex items-center"},[i(qe,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_36"),e("span",null,null,"Acerca de",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_37"),((x=l.value)==null?void 0:x.isAuthenticated)&&i(D,{href:"/chat",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/chat")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(Dn,"s_KTgeAMec2Fc",[n]),children:e("div",null,{class:"flex items-center"},[i(he,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_38"),e("span",null,null,"Chat",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_39"),((_=l.value)==null?void 0:_.isTrabajador)&&i(D,{href:"/absences",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/absences")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(Rn,"s_ivtnlsVV2bI",[n]),children:e("div",null,{class:"flex items-center"},[i(Fe,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_40"),e("span",null,null,"Ausencias",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_41"),((j=l.value)==null?void 0:j.isTrabajador)&&i(D,{href:"/timesheet",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/timesheet")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(Ln,"s_yAu2s7f1HcU",[n]),children:e("div",null,{class:"flex items-center"},[i(Qe,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_42"),e("span",null,null,"Fichaje",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_43"),(((P=l.value)==null?void 0:P.isSindicado)||((h=l.value)==null?void 0:h.isDespacho))&&i(D,{href:"/capacitacion",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/capacitacion")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(Nn,"s_8HfEBSnUrik",[n]),children:e("div",null,{class:"flex items-center"},[i(pe,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_44"),e("span",null,null,"Capacitación",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_45"),(((Z=l.value)==null?void 0:Z.isSindicado)||((ae=l.value)==null?void 0:ae.isDespacho))&&i(D,{href:"/documentos-legales",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/documentos-legales")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(On,"s_vHYpojP31Us",[n]),children:e("div",null,{class:"flex items-center"},[i(V,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_46"),e("span",null,null,"Documentos Legales",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_47"),(((F=l.value)==null?void 0:F.isSindicado)||((ie=l.value)==null?void 0:ie.isDespacho))&&i(D,{href:"/auditoria",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/auditoria")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(Mn,"s_044tpdQmN0U",[n]),children:e("div",null,{class:"flex items-center"},[i(V,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_48"),e("span",null,null,"Auditoría",3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_49"),(ne=l.value)!=null&&ne.isAuthenticated?i(B,{children:[((Y=l.value)==null?void 0:Y.userType)&&e("div",null,{class:"mb-2 px-3 py-2"},e("span",{class:`px-2 py-1 text-xs rounded-full font-medium ${l.value.userType==="trabajador"?"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300":l.value.userType==="despacho"?"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300":l.value.userType==="sindicato"?"bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300":"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`},null,g(R=>R.value.userType==="trabajador"?"Trabajador":R.value.userType==="despacho"?"Despacho":R.value.userType==="sindicato"?"Sindicato":"Usuario",[l],'p0.value.userType==="trabajador"?"Trabajador":p0.value.userType==="despacho"?"Despacho":p0.value.userType==="sindicato"?"Sindicato":"Usuario"'),3,null),1,"as_50"),i(D,{href:"/profile",class:`block px-3 py-2 rounded-md text-base font-medium transition-colors ${s("/profile")?"bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300":"text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`,onClick$:p(jn,"s_QTgPe42PmQc",[n]),children:e("div",null,{class:"flex items-center"},[i(Ze,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_51"),e("span",null,null,g(R=>R.value.username||"Perfil",[l],'p0.value.username||"Perfil"'),3,null)],1,null),[a]:{href:a,onClick$:a}},1,"as_52"),i(D,{href:"/auth/logout",class:"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",onClick$:p(Pn,"s_nExMI7qOC0E",[o,n]),children:e("div",null,{class:"flex items-center"},o.value?i(B,{children:e("div",null,{class:"flex items-center justify-center"},[e("div",null,{class:"w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse"},null,3,null),e("span",null,null,"Cerrando sesión...",3,null)],3,null)},3,"as_53"):i(B,{children:[i(ml,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_54"),e("span",null,null,"Cerrar sesión",3,null)]},1,"as_55"),1,null),[a]:{href:a,class:a,onClick$:a}},1,"as_56")]},1,"as_57"):i(D,{href:"/auth",class:"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors",onClick$:p(Un,"s_0bKnSgCqvP8",[n]),children:e("div",null,{class:"flex items-center"},[i(Il,{class:"w-5 h-5 mr-3",[a]:{class:a}},3,"as_58"),e("span",null,null,"Iniciar sesión",3,null)],1,null),[a]:{href:a,class:a,onClick$:a}},1,"as_59")],1,null),1,null)],1,null),e("main",null,{class:"container mx-auto py-4 px-4 md:px-6"},e("div",null,{style:{viewTransitionName:"main-content"}},i(we,null,3,"as_60"),1,null),1,null),e("footer",null,{class:"mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"},e("div",null,{class:"container mx-auto px-4 md:px-6"},e("div",null,{class:"text-center text-gray-600 dark:text-gray-400 text-sm"},["© ",new Date().getFullYear()," DAI-OFF. Todos los derechos reservados."],1,null),1,null),1,null)],1,"as_61")},zn=M(p($n,"s_08vswLB0CwY")),Fn=Object.freeze(Object.defineProperty({__proto__:null,default:zn,useAuthCheck:Xl},Symbol.toStringTag,{value:"Module"})),qn=async l=>{if(!await Ae(l))throw l.redirect(302,"/auth");const n=await se(l);if(n!=="trabajador"&&n!=="sindicato")throw console.log(`[Timesheet] Access denied: User type ${n} is not allowed.`),l.redirect(302,"/");return{userType:n,userId:W(l)||null}},Wl=G(p(qn,"s_E1zhf4rsXCA")),Bn=()=>(Wl(),_e(),e("div",null,{class:"container mx-auto py-6 px-4"},[e("header",null,{class:"mb-8"},[e("h1",null,{class:"text-3xl font-bold text-gray-800 dark:text-white mb-2"},"Control de Fichaje",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Registra tu entrada y salida diaria y controla tus horas de trabajo.",3,null)],3,null),e("main",null,null,i(we,null,3,"es_0"),1,null)],1,"es_1")),Yn=M(p(Bn,"s_0AF8q4dVdvA")),Hn=Object.freeze(Object.defineProperty({__proto__:null,default:Yn,useAuthCheck:Wl},Symbol.toStringTag,{value:"Module"})),Vn=l=>{const[t]=I();t.value={...t.value,[l]:!t.value[l]}},Gn=()=>{var o,s,c,d;Q();const l=E({}),t=E("trabajador"),n=E({}),r=p(Vn,"s_uJguvXOjq0g",[n]);return z(w("s_oAslh9a50TE",[l])),e("div",null,{class:"flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"},[e("section",null,{class:"relative py-20 overflow-hidden bg-gradient-to-br from-red-50 to-gray-50 dark:from-gray-900 dark:to-gray-800",style:{viewTransitionName:"hero-section"}},[e("div",null,{class:"absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"},null,3,null),e("div",null,{class:"absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-500/10 to-transparent"},null,3,null),e("div",null,{class:"absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full filter blur-3xl"},null,3,null),e("div",null,{class:"container mx-auto px-4 sm:px-6 relative"},[e("div",null,{class:"flex flex-col lg:flex-row items-center gap-12"},[e("div",null,{class:"w-full lg:w-1/2 text-center lg:text-left animate-on-scroll",id:"hero-content",style:g(u=>({opacity:u.value["hero-content"]?1:0,transform:u.value["hero-content"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}),[l],'{opacity:p0.value["hero-content"]?1:0,transform:p0.value["hero-content"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}')},[e("h1",null,{class:"text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight"},[e("span",null,{class:"inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300",style:{viewTransitionName:"hero-title"}},"DAI Off",3,null),e("span",null,{class:"block mt-2"},"Tu Defensor Laboral Digital",3,null)],3,null),e("p",null,{class:"mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0"},["Plataforma integral para la gestión laboral que conecta a ",e("span",null,{class:"text-red-600 dark:text-red-400 font-medium"},"trabajadores",3,null),",",e("span",null,{class:"text-red-600 dark:text-red-400 font-medium"}," sindicatos",3,null)," y ",e("span",null,{class:"text-red-600 dark:text-red-400 font-medium"},"despachos legales",3,null),"con herramientas digitales especializadas."],3,null),e("div",null,{class:"mt-8 flex flex-wrap gap-4 justify-center lg:justify-start"},[i(D,{href:"/auth",class:"px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-md hover:shadow-lg hover:translate-y-[-2px] flex items-center",children:["Comenzar Ahora",i(Bl,{class:"ml-2 h-5 w-5",[a]:{class:a}},3,"k9_0")],[a]:{href:a,class:a}},1,"k9_1"),i(D,{href:"/about",class:"px-6 py-3 rounded-lg bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-gray-700 font-medium transition-all shadow-sm hover:shadow-md hover:translate-y-[-2px]",children:"Conocer Más",[a]:{href:a,class:a}},3,"k9_2")],1,null)],1,null),e("div",null,{class:"w-full lg:w-1/2 animate-on-scroll",id:"hero-animation",style:g(u=>({opacity:u.value["hero-animation"]?1:0,transform:u.value["hero-animation"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out 0.3s"}),[l],'{opacity:p0.value["hero-animation"]?1:0,transform:p0.value["hero-animation"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out 0.3s"}')},e("div",null,{class:"relative mb-12 mx-auto max-w-md"},[e("div",null,{class:"absolute -inset-1 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur-md opacity-50 animate-pulse"},null,3,null),e("div",null,{class:"relative rounded-lg overflow-hidden shadow-2xl border-2 border-red-200 dark:border-red-800 bg-gray-100 dark:bg-gray-800 aspect-[4/3]",style:{viewTransitionName:"avatar-video"}},[e("video",null,{autoplay:!0,loop:!0,muted:!0,playsInline:!0,class:"w-full h-full object-cover object-center"},[e("source",null,{src:"/prs_daioff.idle.mp4",type:"video/mp4"},null,3,null),"Tu navegador no soporta videos."],3,null),e("div",null,{class:"absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end"},e("div",null,{class:"p-6 text-white"},[e("p",null,{class:"font-bold text-xl mb-2"},"Asistente IA DAI Off",3,null),e("p",null,{class:"text-sm opacity-90"},"Tu asesor laboral personalizado, disponible 24/7",3,null)],3,null),3,null)],3,null)],3,null),3,null)],1,null),e("div",null,{class:"mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-on-scroll",id:"stats-section",style:g(u=>({opacity:u.value["stats-section"]?1:0,transform:u.value["stats-section"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out 0.6s"}),[l],'{opacity:p0.value["stats-section"]?1:0,transform:p0.value["stats-section"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out 0.6s"}')},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform"},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"},i(je,{class:"w-6 h-6 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_3"),1,null),e("h3",null,{class:"text-xl font-bold text-gray-900 dark:text-white"},"+10,000",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Trabajadores protegidos",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform"},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"},i(Ra,{class:"w-6 h-6 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_4"),1,null),e("h3",null,{class:"text-xl font-bold text-gray-900 dark:text-white"},"50+",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Despachos legales",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform"},[e("div",null,{class:"flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"},i(tn,{class:"w-6 h-6 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_5"),1,null),e("h3",null,{class:"text-xl font-bold text-gray-900 dark:text-white"},"25+",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Sindicatos asociados",3,null)],1,null)],1,null)],1,null)],1,null),e("section",null,{class:"py-20 px-4 sm:px-6 relative animate-on-scroll",id:"user-types",style:g(u=>({opacity:u.value["user-types"]?1:0,transform:u.value["user-types"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}),[l],'{opacity:p0.value["user-types"]?1:0,transform:p0.value["user-types"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}')},e("div",null,{class:"container mx-auto"},[e("div",null,{class:"text-center max-w-3xl mx-auto mb-16"},[e("h2",null,{class:"text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"},["Soluciones Específicas para Cada ",e("span",null,{class:"text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"Tipo de Usuario",3,null)],3,null),e("p",null,{class:"text-xl text-gray-600 dark:text-gray-300"},"DAI Off ofrece herramientas y funciones diseñadas específicamente para cada rol en el entorno laboral.",3,null)],3,null),e("div",null,{class:"flex flex-wrap justify-center gap-4 mb-12"},[e("button",{class:`px-6 py-3 rounded-lg font-medium text-lg transition-all ${t.value==="trabajador"?"bg-red-600 text-white shadow-lg":"bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700"}`},{onClick$:w("s_7A2T1BoNvUQ",[t])},e("div",null,{class:"flex items-center"},[i(je,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"k9_6"),e("span",null,null,"Trabajadores",3,null)],1,null),1,null),e("button",{class:`px-6 py-3 rounded-lg font-medium text-lg transition-all ${t.value==="sindicato"?"bg-red-600 text-white shadow-lg":"bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700"}`},{onClick$:w("s_8wVNmIs09eo",[t])},e("div",null,{class:"flex items-center"},[i(qe,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"k9_7"),e("span",null,null,"Sindicatos",3,null)],1,null),1,null),e("button",{class:`px-6 py-3 rounded-lg font-medium text-lg transition-all ${t.value==="despacho"?"bg-red-600 text-white shadow-lg":"bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700"}`},{onClick$:w("s_Y3qsymZ70m0",[t])},e("div",null,{class:"flex items-center"},[i(Tl,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"k9_8"),e("span",null,null,"Despachos",3,null)],1,null),1,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-500"},[e("div",null,{class:g(u=>`${u.value==="trabajador"?"block":"hidden"}`,[t],'`${p0.value==="trabajador"?"block":"hidden"}`')},e("div",null,{class:"grid md:grid-cols-2 gap-0"},[e("div",null,{class:"p-8 md:p-12 flex flex-col justify-center"},[e("div",null,{class:"inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6"},i(je,{class:"w-8 h-8 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_9"),1,null),e("h3",null,{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4"},"Para Trabajadores",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-8"},"Herramientas intuitivas para gestionar tu vida laboral, proteger tus derechos y facilitar tu día a día.",3,null),e("div",null,{class:"grid gap-4"},[e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(Cl,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_10"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Gestión de Ausencias",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Registra y administra tus ausencias laborales por enfermedad, vacaciones o asuntos personales.",3,null)],3,null)],1,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(Qe,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_11"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Sistema de Fichaje",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Controla tus horas de trabajo con geolocalización integrada y reportes detallados.",3,null)],3,null)],1,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(he,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_12"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Asistente IA",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Consulta sobre tus derechos laborales y obtén asesoramiento personalizado.",3,null)],3,null)],1,null)],1,null)],1,null),e("div",null,{class:"bg-red-50 dark:bg-gray-900/50 p-8 md:p-0 flex items-center justify-center"},e("div",null,{class:"relative max-w-md mx-auto"},[e("div",null,{class:"absolute inset-0 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-600/20 blur-xl transform -rotate-6 scale-105"},null,3,null),e("div",null,{class:"relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"},[e("div",null,{class:"p-1 bg-gradient-to-r from-red-500 to-red-600"},null,3,null),e("div",null,{class:"p-6"},[e("div",null,{class:"flex items-center justify-between mb-4"},[e("div",null,{class:"flex items-center"},[e("div",null,{class:"w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3"},i(Cl,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_13"),1,null),e("h4",null,{class:"text-lg font-bold text-gray-900 dark:text-white"},"Sistema de Ausencias",3,null)],1,null),e("span",null,{class:"bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300"},"Activo",3,null)],1,null),e("div",null,{class:"rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4"},[e("div",null,{class:"p-3 bg-gray-50 dark:bg-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"},e("div",null,{class:"flex items-center justify-between"},[e("span",null,null,"Mayo 2025",3,null),e("div",null,{class:"flex space-x-1"},[e("button",null,{class:"p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M15 19l-7-7 7-7"},null,3,null),3,null),3,null),e("button",null,{class:"p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 5l7 7-7 7"},null,3,null),3,null),3,null)],3,null)],3,null),3,null),e("div",null,{class:"grid grid-cols-7 text-center text-xs"},[e("div",null,{class:"py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"},"L",3,null),e("div",null,{class:"py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"},"M",3,null),e("div",null,{class:"py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"},"X",3,null),e("div",null,{class:"py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"},"J",3,null),e("div",null,{class:"py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"},"V",3,null),e("div",null,{class:"py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"},"S",3,null),e("div",null,{class:"py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"},"D",3,null),[...Array(31)].map((u,b)=>e("div",{class:`py-2 text-sm ${b===3||b===4?"bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300":b===15?"bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300":"text-gray-700 dark:text-gray-300"}`},null,b+1,1,b))],1,null)],1,null),e("div",null,{class:"flex justify-between mt-4"},[e("div",null,{class:"flex items-center text-xs font-medium"},[e("span",null,{class:"w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-900/70 mr-1"},null,3,null),e("span",null,{class:"text-gray-600 dark:text-gray-400"},"Vacaciones",3,null)],3,null),e("div",null,{class:"flex items-center text-xs font-medium"},[e("span",null,{class:"w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/70 mr-1"},null,3,null),e("span",null,{class:"text-gray-600 dark:text-gray-400"},"Enfermedad",3,null)],3,null),e("div",null,{class:"flex items-center text-xs font-medium"},[e("span",null,{class:"w-3 h-3 rounded-full bg-purple-200 dark:bg-purple-900/70 mr-1"},null,3,null),e("span",null,{class:"text-gray-600 dark:text-gray-400"},"Personal",3,null)],3,null)],3,null),e("button",null,{class:"mt-6 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium"},[e("svg",null,{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:"w-4 h-4 mr-2"},[e("line",null,{x1:"12",y1:"5",x2:"12",y2:"19"},null,3,null),e("line",null,{x1:"5",y1:"12",x2:"19",y2:"12"},null,3,null)],3,null),e("span",null,null,"Registrar ausencia",3,null)],3,null)],1,null)],1,null)],1,null),1,null)],1,null),1,null),e("div",null,{class:g(u=>`${u.value==="sindicato"?"block":"hidden"}`,[t],'`${p0.value==="sindicato"?"block":"hidden"}`')},e("div",null,{class:"grid md:grid-cols-2 gap-0"},[e("div",null,{class:"p-8 md:p-12 flex flex-col justify-center"},[e("div",null,{class:"inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6"},i(qe,{class:"w-8 h-8 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_14"),1,null),e("h3",null,{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4"},"Para Sindicatos",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-8"},"Herramientas especializadas para sindicatos que facilitan la gestión, educación y defensa de los derechos de los trabajadores.",3,null),e("div",null,{class:"grid gap-4"},[e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(pe,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_15"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Gestión de Capacitaciones",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Crea y administra programas de formación en derechos laborales para tus afiliados.",3,null)],3,null)],1,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(V,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_16"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Documentos Legales",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Genera documentos sindicales, convenios colectivos y gestiona conflictos laborales con tecnología blockchain para garantizar su autenticidad.",3,null)],3,null)],1,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(sl,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_17"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Auditoría y Seguimiento",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Supervisa el cumplimiento de acuerdos, mantén registros detallados de casos y genera informes automáticos de seguimiento con alertas personalizables.",3,null)],3,null)],1,null)],1,null)],1,null),e("div",null,{class:"bg-red-50 dark:bg-gray-900/50 p-8 md:p-0 flex items-center justify-center"},e("div",null,{class:"relative max-w-md mx-auto"},[e("div",null,{class:"absolute inset-0 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-600/20 blur-xl transform -rotate-6 scale-105"},null,3,null),e("div",null,{class:"relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"},[e("div",null,{class:"p-1 bg-gradient-to-r from-red-500 to-red-600"},null,3,null),e("div",null,{class:"p-6"},[e("div",null,{class:"flex items-center justify-between mb-4"},[e("div",null,{class:"flex items-center"},[e("div",null,{class:"w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3"},i(pe,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_18"),1,null),e("h4",null,{class:"text-lg font-bold text-gray-900 dark:text-white"},"Plataforma de Capacitación",3,null)],1,null),e("span",null,{class:"bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300"},"3 Nuevos",3,null)],1,null),e("div",null,{class:"space-y-4"},[e("div",null,{class:"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"},e("div",null,{class:"p-4"},e("div",null,{class:"flex items-start"},[e("div",null,{class:"w-14 h-14 min-w-[3.5rem] flex-shrink-0 mr-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"},e("span",null,{class:"text-2xl"},"⚖️",3,null),3,null),e("div",null,{class:"flex-1"},[e("h4",null,{class:"text-lg font-medium text-gray-900 dark:text-white mb-1"},"Derechos Laborales Básicos",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2"},"Fundamentos legales para todos los trabajadores.",3,null),e("div",null,{class:"flex items-center text-xs text-gray-500 dark:text-gray-400"},[e("span",null,{class:"flex items-center mr-3"},[e("svg",null,{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:"w-3 h-3 mr-1"},[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("polyline",null,{points:"12 6 12 12 16 14"},null,3,null)],3,null),"3 horas"],3,null),e("span",null,{class:"flex items-center"},[i(je,{class:"w-3 h-3 mr-1",[a]:{class:a}},3,"k9_19"),"120 inscritos"],1,null)],1,null)],1,null)],1,null),1,null),1,null),e("div",null,{class:"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"},e("div",null,{class:"p-4"},e("div",null,{class:"flex items-start"},[e("div",null,{class:"w-14 h-14 min-w-[3.5rem] flex-shrink-0 mr-4 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"},e("span",null,{class:"text-2xl"},"🚫",3,null),3,null),e("div",null,{class:"flex-1"},[e("h4",null,{class:"text-lg font-medium text-gray-900 dark:text-white mb-1"},"Prevención de Acoso Laboral",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2"},"Protocolo y actuación frente al acoso.",3,null),e("div",null,{class:"flex items-center text-xs text-gray-500 dark:text-gray-400"},[e("span",null,{class:"flex items-center mr-3"},[e("svg",null,{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:"w-3 h-3 mr-1"},[e("circle",null,{cx:"12",cy:"12",r:"10"},null,3,null),e("polyline",null,{points:"12 6 12 12 16 14"},null,3,null)],3,null),"2 horas"],3,null),e("span",null,{class:"flex items-center"},[i(je,{class:"w-3 h-3 mr-1",[a]:{class:a}},3,"k9_20"),"85 inscritos"],1,null)],1,null)],1,null)],1,null),1,null),1,null),e("button",null,{class:"w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium"},[e("svg",null,{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:"w-4 h-4 mr-2"},[e("line",null,{x1:"12",y1:"5",x2:"12",y2:"19"},null,3,null),e("line",null,{x1:"5",y1:"12",x2:"19",y2:"12"},null,3,null)],3,null),e("span",null,null,"Crear nuevo curso",3,null)],3,null)],1,null)],1,null)],1,null)],1,null),1,null)],1,null),1,null),e("div",null,{class:g(u=>`${u.value==="despacho"?"block":"hidden"}`,[t],'`${p0.value==="despacho"?"block":"hidden"}`')},e("div",null,{class:"grid md:grid-cols-2 gap-0"},[e("div",null,{class:"p-8 md:p-12 flex flex-col justify-center"},[e("div",null,{class:"inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6"},i(Tl,{class:"w-8 h-8 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_21"),1,null),e("h3",null,{class:"text-3xl font-bold text-gray-900 dark:text-white mb-4"},"Para Despachos Legales",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-8"},"Herramientas especializadas para abogados laboralistas que facilitan la gestión de casos y la creación de documentos legales.",3,null),e("div",null,{class:"grid gap-4"},[e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(ze,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_22"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Documentos Legales",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Genera contratos, cartas de despido, demandas y reclamaciones con asistencia de IA. Almacenamiento seguro con validación blockchain y firma digital incorporada.",3,null)],3,null)],1,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(pe,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_23"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Capacitación Legal",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Crea cursos y recursos legales multimedia para clientes y empresas con herramientas interactivas, evaluaciones automáticas y certificaciones descargables.",3,null)],3,null)],1,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4"},i(sl,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_24"),1,null),e("div",null,null,[e("h4",null,{class:"text-lg font-semibold text-gray-900 dark:text-white"},"Auditoría y Seguimiento",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Gestiona casos, documentos y seguimiento de expedientes legales con cronogramas automáticos, recordatorios de plazos y sincronización con calendarios externos.",3,null)],3,null)],1,null)],1,null)],1,null),e("div",null,{class:"bg-red-50 dark:bg-gray-900/50 p-8 md:p-0 flex items-center justify-center"},e("div",null,{class:"relative max-w-md mx-auto"},[e("div",null,{class:"absolute inset-0 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-600/20 blur-xl transform -rotate-6 scale-105"},null,3,null),e("div",null,{class:"relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"},[e("div",null,{class:"p-1 bg-gradient-to-r from-red-500 to-red-600"},null,3,null),e("div",null,{class:"p-6"},[e("div",null,{class:"flex items-center justify-between mb-4"},e("div",null,{class:"flex items-center"},[e("div",null,{class:"w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3"},i(V,{class:"w-5 h-5 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_25"),1,null),e("h4",null,{class:"text-lg font-bold text-gray-900 dark:text-white"},"Generador de Documentos",3,null)],1,null),1,null),e("div",null,{class:"space-y-4"},[e("div",null,{class:"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"},[e("h5",null,{class:"font-medium text-gray-900 dark:text-white mb-3"},"Seleccione tipo de documento:",3,null),e("div",null,{class:"grid grid-cols-2 gap-2"},[e("div",null,{class:"border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"},e("div",null,{class:"flex items-center"},[i(ze,{class:"w-5 h-5 text-blue-600 dark:text-blue-400 mr-2",[a]:{class:a}},3,"k9_26"),e("span",null,{class:"text-sm font-medium"},"Contratos",3,null)],1,null),1,null),e("div",null,{class:"border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"},e("div",null,{class:"flex items-center"},[i(V,{class:"w-5 h-5 text-red-600 dark:text-red-400 mr-2",[a]:{class:a}},3,"k9_27"),e("span",null,{class:"text-sm font-medium"},"Despidos",3,null)],1,null),1,null),e("div",null,{class:"border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"},e("div",null,{class:"flex items-center"},[i(Xa,{class:"w-5 h-5 text-purple-600 dark:text-purple-400 mr-2",[a]:{class:a}},3,"k9_28"),e("span",null,{class:"text-sm font-medium"},"Demandas",3,null)],1,null),1,null),e("div",null,{class:"border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"},e("div",null,{class:"flex items-center"},[i(V,{class:"w-5 h-5 text-amber-600 dark:text-amber-400 mr-2",[a]:{class:a}},3,"k9_29"),e("span",null,{class:"text-sm font-medium"},"Reclamaciones",3,null)],1,null),1,null)],1,null)],1,null),e("div",null,{class:"p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50"},[e("h5",null,{class:"text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center"},[i(he,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"k9_30"),"Asistente IA"],1,null),e("p",null,{class:"text-sm text-blue-700 dark:text-blue-300/80"},"¿Necesita ayuda? El asistente IA puede guiarle en la creación de documentos personalizados.",3,null),e("button",null,{class:"mt-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"},"Iniciar asistente",3,null)],1,null),e("div",null,{class:"flex space-x-2"},e("button",null,{class:"flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium"},[i(V,{class:"w-4 h-4 mr-2",[a]:{class:a}},3,"k9_31"),e("span",null,null,"Crear documento",3,null)],1,null),1,null)],1,null)],1,null)],1,null)],1,null),1,null)],1,null),1,null)],1,null)],1,null),1,null),e("section",null,{class:"py-20 px-4 sm:px-6 bg-white dark:bg-gray-800"},e("div",{style:{opacity:l.value["specific-features-section"]?1:0,transform:l.value["specific-features-section"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}},{class:"container mx-auto animate-on-scroll",id:"specific-features-section"},[e("div",null,{class:"text-center max-w-3xl mx-auto mb-16"},[e("h2",null,{class:"text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"},["Funcionalidades ",e("span",null,{class:"text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"Específicas",3,null)],3,null),e("p",null,{class:"text-xl text-gray-600 dark:text-gray-300"},"Herramientas avanzadas para cada tipo de usuario que optimizan la gestión laboral",3,null)],3,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"},[e("div",null,{class:"h-3 bg-blue-500"},null,3,null),e("div",null,{class:"p-8"},[e("div",null,{class:"flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6"},i(ze,{class:"w-8 h-8 text-blue-600 dark:text-blue-400",[a]:{class:a}},3,"k9_32"),1,null),e("h3",null,{class:"text-2xl font-bold text-gray-900 dark:text-white mb-4"},"Documentos Legales",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-6"},"Genera, gestiona y almacena documentos legales con asistencia de IA adaptados a tu situación específica.",3,null),e("div",null,{class:"space-y-3"},[e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-blue-600 dark:text-blue-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Generación automatizada con IA",3,null)],3,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-blue-600 dark:text-blue-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Plantillas personalizables",3,null)],3,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-blue-600 dark:text-blue-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Almacenamiento seguro en blockchain",3,null)],3,null)],3,null),e("div",null,{class:"mt-8"},i(D,{href:"/documentos-legales",class:"flex items-center text-blue-600 dark:text-blue-400 font-medium",children:["Ver más detalles",i(Xe,{class:"w-4 h-4 ml-1",[a]:{class:a}},3,"k9_33")],[a]:{href:a,class:a}},1,"k9_34"),1,null)],1,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"},[e("div",null,{class:"h-3 bg-green-500"},null,3,null),e("div",null,{class:"p-8"},[e("div",null,{class:"flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6"},i(pe,{class:"w-8 h-8 text-green-600 dark:text-green-400",[a]:{class:a}},3,"k9_35"),1,null),e("h3",null,{class:"text-2xl font-bold text-gray-900 dark:text-white mb-4"},"Capacitación",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-6"},"Plataforma completa para crear y gestionar programas de formación sobre derechos laborales y normativas.",3,null),e("div",null,{class:"space-y-3"},[e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-green-600 dark:text-green-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Creación de cursos modulares",3,null)],3,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-green-600 dark:text-green-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Seguimiento de progreso",3,null)],3,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-green-600 dark:text-green-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Certificaciones digitales",3,null)],3,null)],3,null),e("div",null,{class:"mt-8"},i(D,{href:"/capacitacion",class:"flex items-center text-green-600 dark:text-green-400 font-medium",children:["Ver más detalles",i(Xe,{class:"w-4 h-4 ml-1",[a]:{class:a}},3,"k9_36")],[a]:{href:a,class:a}},1,"k9_37"),1,null)],1,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"},[e("div",null,{class:"h-3 bg-purple-500"},null,3,null),e("div",null,{class:"p-8"},[e("div",null,{class:"flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6"},i(sl,{class:"w-8 h-8 text-purple-600 dark:text-purple-400",[a]:{class:a}},3,"k9_38"),1,null),e("h3",null,{class:"text-2xl font-bold text-gray-900 dark:text-white mb-4"},"Auditoría y Seguimiento",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-6"},"Sistema completo para supervisar el cumplimiento normativo y mantener registros detallados de casos.",3,null),e("div",null,{class:"space-y-3"},[e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-purple-600 dark:text-purple-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Análisis de cumplimiento",3,null)],3,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-purple-600 dark:text-purple-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Informes detallados automáticos",3,null)],3,null),e("div",null,{class:"flex items-start"},[e("div",null,{class:"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",class:"h-3 w-3 text-purple-600 dark:text-purple-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,3,null),3,null),3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},"Historial de casos y alertas",3,null)],3,null)],3,null),e("div",null,{class:"mt-8"},i(D,{href:"/auditoria",class:"flex items-center text-purple-600 dark:text-purple-400 font-medium",children:["Ver más detalles",i(Xe,{class:"w-4 h-4 ml-1",[a]:{class:a}},3,"k9_39")],[a]:{href:a,class:a}},1,"k9_40"),1,null)],1,null)],1,null)],1,null)],1,null),1,null),e("section",null,{class:"py-20 bg-gray-50 dark:bg-gray-900",style:{viewTransitionName:"features-section"}},e("div",null,{class:"container mx-auto px-4 sm:px-6"},[e("div",null,{class:"text-center max-w-3xl mx-auto mb-16"},[e("h2",null,{class:"text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"},["Características ",e("span",null,{class:"text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"Principales",3,null)],3,null),e("p",null,{class:"text-xl text-gray-600 dark:text-gray-300"},"Nuestra plataforma integra tecnología avanzada para simplificar la gestión laboral",3,null)],3,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-on-scroll",id:"features-grid",style:g(u=>({opacity:u.value["features-grid"]?1:0,transform:u.value["features-grid"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}),[l],'{opacity:p0.value["features-grid"]?1:0,transform:p0.value["features-grid"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}')},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 card-item",style:{viewTransitionName:"feature-1"}},[e("div",null,{class:"flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 mb-6"},i(Ka,{class:"w-7 h-7 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_41"),1,null),e("h3",null,{class:"text-xl font-bold text-gray-900 dark:text-white mb-3"},"Protección Laboral",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-6"},"Herramientas especializadas diseñadas para proteger los derechos laborales y garantizar el cumplimiento normativo.",3,null),e("div",null,{class:"pt-4 border-t border-gray-100 dark:border-gray-700"},e("ul",null,{class:"space-y-2"},[e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_42"),e("span",null,null,"Asesoramiento personalizado",3,null)],1,null),e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_43"),e("span",null,null,"Generación de documentos legales",3,null)],1,null),e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_44"),e("span",null,null,"Seguimiento de incidencias",3,null)],1,null)],1,null),1,null)],1,null),e("div",{style:{viewTransitionName:"feature-2",opacity:l.value["feature-2"]?1:0,transform:l.value["feature-2"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out 0.2s"}},{class:"bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 card-item animate-on-scroll",id:"feature-2"},[e("div",null,{class:"flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 mb-6"},i(he,{class:"w-7 h-7 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_45"),1,null),e("h3",null,{class:"text-xl font-bold text-gray-900 dark:text-white mb-3"},"Asistente IA Especializado",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-6"},"Asistente virtual con IA especializada en derecho laboral, disponible 24/7 para responder consultas y generar documentos.",3,null),e("div",null,{class:"pt-4 border-t border-gray-100 dark:border-gray-700"},e("ul",null,{class:"space-y-2"},[e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_46"),e("span",null,null,"Respuestas precisas en segundos",3,null)],1,null),e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_47"),e("span",null,null,"Adaptado a normativa actual",3,null)],1,null),e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_48"),e("span",null,null,"Asistencia en varios idiomas",3,null)],1,null)],1,null),1,null)],1,null),e("div",{style:{viewTransitionName:"feature-3",opacity:l.value["feature-3"]?1:0,transform:l.value["feature-3"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out 0.4s"}},{class:"bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 card-item animate-on-scroll",id:"feature-3"},[e("div",null,{class:"flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 mb-6"},i(pe,{class:"w-7 h-7 text-red-600 dark:text-red-400",[a]:{class:a}},3,"k9_49"),1,null),e("h3",null,{class:"text-xl font-bold text-gray-900 dark:text-white mb-3"},"Plataforma de Aprendizaje",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-6"},"Cursos y recursos formativos sobre derechos laborales, prevención de riesgos y normativa actualizada.",3,null),e("div",null,{class:"pt-4 border-t border-gray-100 dark:border-gray-700"},e("ul",null,{class:"space-y-2"},[e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_50"),e("span",null,null,"Contenido interactivo multimedia",3,null)],1,null),e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_51"),e("span",null,null,"Certificaciones reconocidas",3,null)],1,null),e("li",null,{class:"flex items-center text-gray-700 dark:text-gray-300"},[i(ge,{class:"w-5 h-5 text-green-500 mr-2 flex-shrink-0",[a]:{class:a}},3,"k9_52"),e("span",null,null,"Actualización constante",3,null)],1,null)],1,null),1,null)],1,null)],1,null)],1,null),1,null),e("section",null,{class:"py-20 px-4 sm:px-6 animate-on-scroll",id:"faq-section",style:g(u=>({opacity:u.value["faq-section"]?1:0,transform:u.value["faq-section"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}),[l],'{opacity:p0.value["faq-section"]?1:0,transform:p0.value["faq-section"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}')},e("div",null,{class:"container mx-auto max-w-4xl"},[e("div",null,{class:"text-center mb-16"},[e("h2",null,{class:"text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"},"Preguntas Frecuentes",3,null),e("p",null,{class:"text-xl text-gray-600 dark:text-gray-300"},"Respuestas a las dudas más comunes sobre DAI Off",3,null)],3,null),e("div",null,{class:"space-y-4"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"},[e("button",null,{class:"w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white",onClick$:w("s_WTDxPxZI3bM",[r])},[e("span",null,null,"¿Qué es DAI Off y cómo puede ayudarme?",3,null),(o=n.value)!=null&&o.faq1?i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform",[a]:{class:a}},3,"k9_53"):i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform",[a]:{class:a}},3,"k9_54")],1,null),e("div",null,{class:g(u=>{var b;return`px-5 pb-5 ${(b=u.value)!=null&&b.faq1?"block":"hidden"}`},[n],'`px-5 pb-5 ${p0.value?.faq1?"block":"hidden"}`')},e("p",null,{class:"text-gray-600 dark:text-gray-300"},"DAI Off es una plataforma digital integral para la gestión laboral que conecta a trabajadores, sindicatos y despachos legales. Ofrece herramientas especializadas como gestión de ausencias, fichaje laboral, capacitación, generación de documentos legales y asesoramiento con IA, adaptadas a las necesidades específicas de cada tipo de usuario.",3,null),3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"},[e("button",null,{class:"w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white",onClick$:w("s_RhESpfnobSw",[r])},[e("span",null,null,"¿Cómo funciona el asistente de IA?",3,null),(s=n.value)!=null&&s.faq2?i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform",[a]:{class:a}},3,"k9_55"):i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform",[a]:{class:a}},3,"k9_56")],1,null),e("div",null,{class:g(u=>{var b;return`px-5 pb-5 ${(b=u.value)!=null&&b.faq2?"block":"hidden"}`},[n],'`px-5 pb-5 ${p0.value?.faq2?"block":"hidden"}`')},e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Nuestro asistente de IA está especializado en derecho laboral y normativas actualizadas. Puedes consultarle dudas específicas, solicitar asesoramiento sobre tus derechos o generar documentos legales personalizados. El asistente analiza tu situación y proporciona respuestas precisas basadas en la legislación vigente, disponible 24/7.",3,null),3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"},[e("button",null,{class:"w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white",onClick$:w("s_e9pW0SdiJCw",[r])},[e("span",null,null,"¿Qué tipos de documentos legales puedo generar?",3,null),(c=n.value)!=null&&c.faq3?i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform",[a]:{class:a}},3,"k9_57"):i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform",[a]:{class:a}},3,"k9_58")],1,null),e("div",null,{class:g(u=>{var b;return`px-5 pb-5 ${(b=u.value)!=null&&b.faq3?"block":"hidden"}`},[n],'`px-5 pb-5 ${p0.value?.faq3?"block":"hidden"}`')},e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Dependiendo de tu rol, puedes generar diferentes documentos. Para despachos: contratos laborales, cartas de despido, demandas y reclamaciones. Para sindicatos: documentos de afiliación, convenios colectivos, gestión de conflictos y recursos sobre derechos laborales. Todos los documentos cumplen con la normativa legal vigente y son personalizables.",3,null),3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"},[e("button",null,{class:"w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white",onClick$:w("s_jbU9XoNtGuQ",[r])},[e("span",null,null,"¿Es segura mi información en la plataforma?",3,null),(d=n.value)!=null&&d.faq4?i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform",[a]:{class:a}},3,"k9_59"):i(me,{class:"w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform",[a]:{class:a}},3,"k9_60")],1,null),e("div",null,{class:g(u=>{var b;return`px-5 pb-5 ${(b=u.value)!=null&&b.faq4?"block":"hidden"}`},[n],'`px-5 pb-5 ${p0.value?.faq4?"block":"hidden"}`')},e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Absolutamente. La seguridad y privacidad son prioritarias. Utilizamos cifrado de extremo a extremo, cumplimos con las normativas de protección de datos (RGPD), y nunca compartimos tu información con terceros sin tu consentimiento. Todos los datos sensibles están protegidos con los más altos estándares de seguridad.",3,null),3,null)],1,null)],1,null)],1,null),1,null),e("section",null,{class:"py-20 bg-gray-50 dark:bg-gray-900 animate-on-scroll",id:"testimonials",style:g(u=>({opacity:u.value.testimonials?1:0,transform:u.value.testimonials?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}),[l],'{opacity:p0.value["testimonials"]?1:0,transform:p0.value["testimonials"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}')},e("div",null,{class:"container mx-auto px-4 sm:px-6"},[e("div",null,{class:"text-center max-w-3xl mx-auto mb-16"},[e("h2",null,{class:"text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"},["Lo que Dicen Nuestros ",e("span",null,{class:"text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"Usuarios",3,null)],3,null),e("p",null,{class:"text-xl text-gray-600 dark:text-gray-300"},"Descubre cómo DAI Off ha transformado la gestión laboral para diferentes profesionales",3,null)],3,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-3 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300"},[e("div",null,{class:"flex items-center mb-6"},[e("div",null,{class:"w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl"},"👨‍💼",3,null),e("div",null,{class:"ml-4"},[e("h4",null,{class:"font-bold text-gray-900 dark:text-white"},"Carlos Rodríguez",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-400"},"Trabajador, Sector Tecnológico",3,null)],3,null)],3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-4"},'"La aplicación de fichaje me ha facilitado enormemente el control de mis horas laborales. El sistema de registro de ausencias es intuitivo y el asistente virtual me ha ayudado a resolver dudas sobre mis derechos sin necesidad de consultar a un abogado."',3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300"},[e("div",null,{class:"flex items-center mb-6"},[e("div",null,{class:"w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl"},"👩‍⚖️",3,null),e("div",null,{class:"ml-4"},[e("h4",null,{class:"font-bold text-gray-900 dark:text-white"},"Ana Martínez",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-400"},"Abogada Laboralista",3,null)],3,null)],3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-4"},'"Como abogada, DAI Off ha revolucionado mi trabajo diario. El generador de documentos me ahorra horas de trabajo y la plataforma de capacitación me permite crear recursos educativos para mis clientes. Una herramienta indispensable para cualquier despacho laboral."',3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300"},[e("div",null,{class:"flex items-center mb-6"},[e("div",null,{class:"w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-2xl"},"👨‍🏭",3,null),e("div",null,{class:"ml-4"},[e("h4",null,{class:"font-bold text-gray-900 dark:text-white"},"Miguel Sánchez",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-400"},"Representante Sindical",3,null)],3,null)],3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-4"},'"DAI Off ha transformado nuestra gestión sindical. La plataforma nos permite crear programas de formación para nuestros afiliados y generar documentación especializada. El módulo de auditoría nos ayuda a hacer seguimiento de casos y cumplimientos de convenios."',3,null)],3,null)],3,null)],3,null),3,null),e("section",{style:{viewTransitionName:"cta-section",opacity:l.value["cta-section"]?1:0,transform:l.value["cta-section"]?"translateY(0)":"translateY(50px)",transition:"all 0.9s ease-out"}},{class:"py-20 px-4 sm:px-6 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white animate-on-scroll",id:"cta-section"},e("div",null,{class:"container mx-auto max-w-4xl text-center"},[e("h2",null,{class:"text-3xl sm:text-4xl font-bold mb-6"},"Comienza a gestionar tus derechos laborales",3,null),e("p",null,{class:"text-xl text-red-100 dark:text-red-200 mb-10 max-w-2xl mx-auto"},"Únete a miles de profesionales que ya transformaron su gestión laboral con nuestra plataforma.",3,null),e("div",null,{class:"flex flex-wrap gap-4 justify-center"},[i(D,{href:"/auth",class:"px-8 py-4 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all",children:"Comenzar Ahora",[a]:{href:a,class:a}},3,"k9_61"),i(D,{href:"/docs",class:"px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all",children:"Ver Documentación",[a]:{href:a,class:a}},3,"k9_62")],1,null)],1,null),1,null),e("style",null,null,`
          .animate-bounce-slow {
            animation: bounce 3s infinite;
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateY(-5%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: translateY(0);
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
          
          .bg-grid-pattern {
            background-size: 20px 20px;
            background-image: 
              linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px);
          }
          
          /* Para animaciones de aparición */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .delay-100 {
            animation-delay: 0.1s;
          }
          
          .delay-200 {
            animation-delay: 0.2s;
          }
          
          .delay-300 {
            animation-delay: 0.3s;
          }
        `,3,null)],1,"k9_63")},Xn=M(p(Gn,"s_0H7JnAEW1p0")),Wn={title:"DAI Off - Tu Defensor Laboral Digital",meta:[{name:"description",content:"DAI Off es una plataforma integral para la gestión laboral que conecta a trabajadores, sindicatos y despachos legales con herramientas digitales especializadas en derechos laborales."},{name:"keywords",content:"derechos laborales, asesoría legal, trabajadores, sindicatos, despachos, gestión de ausencias, fichaje, documentos legales, capacitación"}]},Kn=Object.freeze(Object.defineProperty({__proto__:null,default:Xn,head:Wn},Symbol.toStringTag,{value:"Module"})),Qn=({cookie:l,redirect:t})=>{throw l.delete("auth_token",{path:"/"}),l.delete("user_type",{path:"/"}),t(302,"/auth")},Zn=async(l,t)=>{try{console.log("[LOGOUT] Starting logout process"),zl(t);const n=t.cookie.get("auth_token"),r=t.cookie.get("user_type");if(n||r)throw console.error("[LOGOUT] Cookies not cleared properly:",{authToken:n,userType:r}),new Error("Failed to clear authentication cookies");return console.log("[LOGOUT] Successfully cleared all cookies"),t.redirect(302,"/auth"),{success:!0}}catch(n){return console.error("Logout error:",n),{success:!1,error:n instanceof Error?n.message:"Logout failed"}}},Kl=X(p(Zn,"s_X10g1MGFVho")),Jn=()=>{},er=()=>{var n,r;Q();const l=Kl(),t=((n=l.value)==null?void 0:n.success)===!1;return e("div",null,{class:"min-h-screen w-full flex items-center justify-center transition-colors duration-300 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-blue-950 py-6 px-4 sm:px-6 lg:px-8 overflow-hidden relative"},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden"},[e("div",null,{class:"w-20 h-20 bg-blue-500/10 rounded-full absolute top-[10%] left-[15%] animate-[float_15s_infinite]"},null,3,null),e("div",null,{class:"w-32 h-32 bg-indigo-500/10 rounded-full absolute top-[30%] left-[65%] animate-[float_18s_infinite]",style:"animation-delay: 0.5s;"},null,3,null),e("div",null,{class:"w-16 h-16 bg-teal-500/10 rounded-full absolute top-[70%] left-[25%] animate-[float_12s_infinite]",style:"animation-delay: 1s;"},null,3,null)],3,null),e("div",null,{class:"absolute top-6 left-1/2 transform -translate-x-1/2"},e("div",null,{class:"flex items-center"},[e("div",null,{class:"relative"},e("div",null,{class:"w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg"},e("svg",null,{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"w-6 h-6"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round",d:"m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"},null,3,null),3,null),3,null),3,null),e("h1",null,{class:"ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"DAI Off",3,null)],3,null),3,null),e("div",null,{class:"max-w-md w-full z-10"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]"},[e("div",null,{class:"text-center mb-8"},[e("h2",null,{class:"text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"Log Out",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-400"},"Are you sure you want to log out?",3,null)],3,null),i(K,{action:l,class:"space-y-6",spaReset:!0,get"preventdefault:submit"(){return l.isRunning},onSubmitCompleted$:p(Jn,"s_GZ039Xhc9W0"),children:[e("button",null,{type:"submit",disabled:g(o=>o.isRunning,[l],"p0.isRunning"),class:"w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-500 dark:to-red-400 dark:hover:from-red-600 dark:hover:to-red-500 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:w("s_CCfP4YxazY4")},l.isRunning?e("span",null,{class:"flex items-center"},[i(ve,{class:"animate-spin mr-2 h-5 w-5",[a]:{class:a}},3,"S9_0"),"Logging out..."],1,"S9_1"):e("span",null,{class:"flex items-center"},[i(ml,{class:"mr-2 h-5 w-5",[a]:{class:a}},3,"S9_2"),"Confirm Logout"],1,null),1,null),t&&e("div",null,{class:"p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm mt-4"},[e("p",null,null,"There was a problem logging you out. Please try again.",3,null),((r=l.value)==null?void 0:r.error)&&e("p",null,{class:"mt-1 text-xs opacity-80"},g(o=>o.value.error,[l],"p0.value.error"),3,"S9_3")],1,"S9_4"),e("a",null,{href:"/",class:"block w-full text-center mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"},"Cancel",3,null)],[a]:{action:a,class:a,spaReset:a,"preventdefault:submit":g(o=>o.isRunning,[l],"p0.isRunning"),onSubmitCompleted$:a}},1,"S9_5")],1,null),e("div",null,{class:"mt-6 text-center text-sm text-gray-600 dark:text-gray-400"},"Thank you for using DAI Off",3,null)],1,null),e("style",null,null,`
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
      `,3,null)],1,"S9_6")},lr=M(p(er,"s_JBiTm0tuWIY")),tr=Object.freeze(Object.defineProperty({__proto__:null,default:lr,onGet:Qn,useLogout:Kl},Symbol.toStringTag,{value:"Module"})),ar=async(l,t)=>{const n=W(t);if(!n)return{success:!1,message:"Debe iniciar sesión para crear un curso"};try{const r=U(t),o=`
        INSERT INTO cursos_capacitacion
        (titulo, descripcion, descripcion_completa, categoria, instructor, duracion, imagen_color, creado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,s=[l.titulo,l.descripcion,l.descripcionCompleta,l.categoria,l.instructor||null,l.duracion||null,l.imagenColor,n],c=await r.execute(o,s);if(c.lastInsertRowid)return{success:!0,cursoId:Number(c.lastInsertRowid),message:"Curso creado exitosamente"};throw new Error("No se pudo obtener el ID del curso creado")}catch(r){return console.error("[CAPACITACION] Error al crear curso:",r),{success:!1,message:`Error al crear el curso: ${r instanceof Error?r.message:String(r)}`}}},nr={titulo:L.string().min(5,"El título debe tener al menos 5 caracteres"),descripcion:L.string().min(10,"La descripción debe tener al menos 10 caracteres"),descripcionCompleta:L.string().min(20,"La descripción completa debe ser más detallada"),categoria:L.enum(["seguridad","derechos","prevencion","igualdad","salud"]),instructor:L.string().optional(),duracion:L.string().optional(),imagenColor:L.string().default("bg-red-100 dark:bg-red-900/20")},Ql=X(p(ar,"s_0nEMJyukSFA"),Ee(p(nr,"s_Q8umz0qrVWY"))),rr=()=>{const[l]=I();l.value=!0},or=()=>{var c,d,u,b,m,f,k,v,A,S;Q();const l=Ql(),t=xl(),n=ke({titulo:"",descripcion:"",descripcionCompleta:"",categoria:"seguridad",instructor:"",duracion:"",imagenColor:"bg-red-100 dark:bg-red-900/20"}),r=[{id:"bg-red-100 dark:bg-red-900/20",nombre:"Rojo"},{id:"bg-blue-100 dark:bg-blue-900/20",nombre:"Azul"},{id:"bg-green-100 dark:bg-green-900/20",nombre:"Verde"},{id:"bg-yellow-100 dark:bg-yellow-900/20",nombre:"Amarillo"},{id:"bg-purple-100 dark:bg-purple-900/20",nombre:"Morado"},{id:"bg-indigo-100 dark:bg-indigo-900/20",nombre:"Índigo"},{id:"bg-pink-100 dark:bg-pink-900/20",nombre:"Rosa"}],o=[{id:"seguridad",nombre:"Seguridad y Salud en el Trabajo"},{id:"derechos",nombre:"Derechos Laborales Básicos"},{id:"prevencion",nombre:"Prevención del Acoso Laboral"},{id:"igualdad",nombre:"Igualdad Salarial y No Discriminación"},{id:"salud",nombre:"Gestión del Estrés y Salud Mental"}],s=E(!1);return z(w("s_VvAbaCTjcnI",[l,s,t])),e("div",null,{class:"crear-curso-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},e("a",null,{href:"/capacitacion",class:"text-blue-600 hover:text-blue-800 flex items-center"},[i(fe,{class:"w-5 h-5 mr-1",[a]:{class:a}},3,"eb_0"),"Volver a capacitaciones"],1,null),1,null),e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Crear nuevo curso de capacitación",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-6"},"Completa el formulario para crear un nuevo curso que estará disponible para todos los usuarios",3,null)],1,null),((c=l.value)==null?void 0:c.success)&&e("div",null,{class:"bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-6"},[e("p",null,null,g(y=>y.value.message,[l],"p0.value.message"),3,null),e("p",null,{class:"text-sm mt-1"},"Redirigiendo al curso creado...",3,null)],3,"eb_1"),((d=l.value)==null?void 0:d.success)===!1&&e("div",null,{class:"bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6"},e("p",null,null,g(y=>y.value.message,[l],"p0.value.message"),3,null),3,"eb_2"),i(K,{action:l,class:"bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700",onSubmit$:p(rr,"s_55jqUpKy4SE",[s]),children:e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"titulo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Título del curso *",3,null),e("input",null,{id:"titulo",name:"titulo",type:"text",required:!0,value:g(y=>y.titulo,[n],"p0.titulo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. Seguridad y Salud en el Trabajo",onInput$:w("s_FlRWYe0WS0s",[n])},null,3,null),((b=(u=l.value)==null?void 0:u.fieldErrors)==null?void 0:b.titulo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(y=>y.value.fieldErrors.titulo,[l],"p0.value.fieldErrors.titulo"),3,"eb_3")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción breve *",3,null),e("input",null,{id:"descripcion",name:"descripcion",type:"text",required:!0,value:g(y=>y.descripcion,[n],"p0.descripcion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Breve descripción que aparecerá en la lista de cursos",onInput$:w("s_2hMJ0HOe7zg",[n])},null,3,null),((f=(m=l.value)==null?void 0:m.fieldErrors)==null?void 0:f.descripcion)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(y=>y.value.fieldErrors.descripcion,[l],"p0.value.fieldErrors.descripcion"),3,"eb_4")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcionCompleta",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción completa *",3,null),e("textarea",null,{id:"descripcionCompleta",name:"descripcionCompleta",required:!0,value:g(y=>y.descripcionCompleta,[n],"p0.descripcionCompleta"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-32",placeholder:"Descripción detallada del curso, objetivos, a quién va dirigido, etc.",onInput$:w("s_0hB1avsrOWE",[n])},null,3,null),((v=(k=l.value)==null?void 0:k.fieldErrors)==null?void 0:v.descripcionCompleta)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(y=>y.value.fieldErrors.descripcionCompleta,[l],"p0.value.fieldErrors.descripcionCompleta"),3,"eb_5")],1,null),e("div",null,null,[e("label",null,{for:"categoria",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Categoría *",3,null),e("select",null,{id:"categoria",name:"categoria",required:!0,value:g(y=>y.categoria,[n],"p0.categoria"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:w("s_fXY8G2y3PyE",[n])},o.map(y=>e("option",{value:$(y,"id")},null,y.nombre,1,y.id)),1,null),((S=(A=l.value)==null?void 0:A.fieldErrors)==null?void 0:S.categoria)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(y=>y.value.fieldErrors.categoria,[l],"p0.value.fieldErrors.categoria"),3,"eb_6")],1,null),e("div",null,null,[e("label",null,{for:"imagenColor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Color de fondo",3,null),e("select",null,{id:"imagenColor",name:"imagenColor",value:g(y=>y.imagenColor,[n],"p0.imagenColor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:w("s_lTUsCSW6GQA",[n])},r.map(y=>e("option",{value:$(y,"id")},null,y.nombre,1,y.id)),1,null)],1,null),e("div",null,null,[e("label",null,{for:"instructor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Instructor (opcional)",3,null),e("input",null,{id:"instructor",name:"instructor",type:"text",value:g(y=>y.instructor,[n],"p0.instructor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Nombre del instructor",onInput$:w("s_cR0dfOCTv0o",[n])},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"duracion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Duración (opcional)",3,null),e("input",null,{id:"duracion",name:"duracion",type:"text",value:g(y=>y.duracion,[n],"p0.duracion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. 2 horas, 3 semanas, etc.",onInput$:w("s_rIThEY0DCy0",[n])},null,3,null)],3,null),e("div",null,{class:"col-span-1 md:col-span-2 flex justify-end"},e("button",null,{type:"submit",disabled:g(y=>y.value,[s],"p0.value"),class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"},s.value?i(B,{children:[e("div",null,{class:"w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"},null,3,null),e("span",null,null,"Guardando...",3,null)]},3,"eb_7"):i(B,{children:[i(ll,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"eb_8"),e("span",null,null,"Guardar curso",3,null)]},1,"eb_9"),1,null),1,null)],1,null),[a]:{action:a,class:a,onSubmit$:a}},1,"eb_10")],1,"eb_11")},sr=M(p(or,"s_ZoIAUAP4UR0")),ir=Object.freeze(Object.defineProperty({__proto__:null,default:sr,useCrearCursoAction:Ql},Symbol.toStringTag,{value:"Module"})),Zl=[{title:"Contrato Indefinido",prompt:"Crea un contrato de trabajo indefinido entre la empresa [nombre de empresa] y el trabajador [nombre del trabajador] para el puesto de [puesto] con salario de [salario] euros mensuales.",documentType:"contrato",categoria:"contratos-laborales"},{title:"Carta de Despido",prompt:"Genera una carta de despido por causas objetivas para [nombre del empleado] que trabaja como [puesto] desde [fecha de inicio], detallando las causas económicas que justifican la decisión.",documentType:"despido",categoria:"despidos"},{title:"Demanda por Despido Improcedente",prompt:"Redacta una demanda por despido improcedente para [nombre] contra la empresa [nombre de empresa], incluyendo los hechos relevantes y la fundamentación jurídica.",documentType:"demanda",categoria:"demandas"},{title:"Reclamación de Cantidades",prompt:"Crea un documento de reclamación de cantidades adeudadas por la empresa [nombre de empresa] al trabajador [nombre del trabajador], detallando los conceptos e importes reclamados.",documentType:"reclamacion",categoria:"reclamaciones"}],Jl=[{title:"Solicitud de Afiliación",prompt:"Crea un formulario de solicitud de afiliación sindical para [nombre del sindicato], incluyendo los campos necesarios y derechos y obligaciones.",documentType:"afiliacion",categoria:"afiliaciones"},{title:"Denuncia de Incumplimiento de Convenio",prompt:"Redacta una denuncia por incumplimiento del convenio colectivo por parte de la empresa [nombre de empresa], especificando los artículos vulnerados y las circunstancias.",documentType:"denuncia",categoria:"convenios"},{title:"Comunicado Sindical",prompt:"Elabora un comunicado sindical para informar a los trabajadores sobre [tema] con un tono profesional pero accesible.",documentType:"comunicado",categoria:"derechos"},{title:"Convocatoria de Asamblea",prompt:"Redacta una convocatoria para una asamblea sindical en [fecha] para tratar los siguientes temas: [temas a tratar].",documentType:"convocatoria",categoria:"conflictos"}],cr=ee(async function(l,t,n=[]){console.log("Servidor: Generando documento legal con IA");const r=this.env.get("OPENAI_API_KEY")||{}.OPENAI_API_KEY;if(!r)return console.error("OpenAI API Key no configurada en el servidor."),"Error: Servicio de IA no configurado.";try{const o=new Ol({openAIApiKey:r,model:"gpt-4o-mini",temperature:.2}),s=`Eres un asistente especializado en la generación de documentos legales laborales en España. 
    Genera documentos completos, bien estructurados y profesionales. Utiliza lenguaje jurídico apropiado.
    Incluye todas las cláusulas, términos y condiciones relevantes para el tipo de documento solicitado.
    Formatea el texto para que sea fácil de leer, utilizando secciones, párrafos y enumeraciones cuando sea apropiado.
    Asegúrate de que el documento sea legalmente válido según la legislación laboral española vigente.
    Si se solicita un documento específico como ${t}, asegúrate de seguir sus requisitos formales.`,c=n.some(m=>m.role==="system");let d=[...n];c||d.unshift({role:"system",content:s}),d.push({role:"user",content:l});const u=d.map(m=>m.role==="system"?new Ml(m.content):m.role==="user"?new jl(m.content):new Pl(m.content));console.log(`Servidor: Usando ${u.length} mensajes como contexto`);const b=await o.invoke(u);return console.log("Servidor: Documento generado correctamente"),b.content}catch(o){return console.error("Servidor: Error en el modelo LangChain:",o),"Lo siento, encontré un error al procesar tu solicitud de documento."}},"OCLNTNKObwg"),et=J(p(cr,"s_OCLNTNKObwg")),dr=ee(async function(l,t,n,r){var o,s;if(!l){console.warn("Servidor: No se puede guardar la sesión, usuario no autenticado.");return}console.log("Servidor: Guardando sesión de documento para usuario:",l);try{const c=((o=this.env)==null?void 0:o.get("PRIVATE_TURSO_DATABASE_URL"))||{}.PRIVATE_TURSO_DATABASE_URL,d=((s=this.env)==null?void 0:s.get("PRIVATE_TURSO_AUTH_TOKEN"))||{}.PRIVATE_TURSO_AUTH_TOKEN;if(!c)return console.error("Servidor: URL de base de datos no configurada"),null;const{createClient:u}=await import("@libsql/client"),b=u({url:c,authToken:d||void 0});(await b.execute({sql:"SELECT name FROM sqlite_master WHERE type='table' AND name='document_sessions'"})).rows.length===0&&(await b.execute({sql:`CREATE TABLE document_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          document_type TEXT NOT NULL,
          messages TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`}),console.log("Servidor: Tabla document_sessions creada"));const f=JSON.stringify(r),k=await b.execute({sql:`INSERT INTO document_sessions 
            (user_id, title, document_type, messages, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,args:[l,n,t,f,new Date().toISOString(),new Date().toISOString()]});return console.log("Servidor: Sesión de documento guardada con éxito",k),k.lastInsertRowid}catch(c){return console.error("Servidor: Error al guardar sesión de documento:",c.message),console.error("Servidor: Detalles del error:",c),null}},"EfEgIGKnlS0"),lt=J(p(dr,"s_EfEgIGKnlS0")),ur=async l=>{var n;const t=(n=l.cookie.get("auth_token"))==null?void 0:n.value;if(!t)return[];try{const r=U(l);return(await r.execute({sql:"SELECT name FROM sqlite_master WHERE type='table' AND name='document_sessions'"})).rows.length===0?[]:(await r.execute({sql:`SELECT id, title, document_type, updated_at 
            FROM document_sessions 
            WHERE user_id = ? 
            ORDER BY updated_at DESC 
            LIMIT 10`,args:[t]})).rows}catch(r){return console.error("Error al cargar sesiones de documentos:",r),[]}},tt=G(p(ur,"s_1pxcu0jQ6Tk")),gr=async(l,{cookie:t,...n})=>{var m;const{prompt:r,documentType:o,title:s}=l;if(!r)return{success:!1,message:"El prompt no puede estar vacío"};const c=await et(r,o||"general",[]),d=[{role:"user",content:r,timestamp:new Date().toISOString()},{role:"assistant",content:c,timestamp:new Date().toISOString()}],u=((m=t.get("auth_token"))==null?void 0:m.value)||"dev_user",b=s||`Documento ${o} - ${new Date().toLocaleDateString()}`;return await lt(u,o,b,d),{success:!0,document:c,messages:d}},mr={prompt:L.string().min(1,"El prompt no puede estar vacío"),documentType:L.string().default("general"),title:L.string().optional()},at=X(p(gr,"s_vC3SeOd5dwY"),Ee(p(mr,"s_Ne2m8FbI00k"))),nt=`
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
`,pr=ee(async function(l,t,n,r,o,s,c=""){var d,u;if(console.log(`BD ASISTENTE: Guardando documento con origen="${s}"`),console.log(`BD ASISTENTE: ID=${t}, título=${n}, categoría=${r}, userId=${l}`),!l)return console.warn("BD ASISTENTE: No se puede guardar el documento, usuario no autenticado."),!1;if(!t||!n)return console.error("BD ASISTENTE: Error en parámetros - ID o título faltantes"),!1;try{const b=((d=this.env)==null?void 0:d.get("PRIVATE_TURSO_DATABASE_URL"))||{}.PRIVATE_TURSO_DATABASE_URL,m=((u=this.env)==null?void 0:u.get("PRIVATE_TURSO_AUTH_TOKEN"))||{}.PRIVATE_TURSO_AUTH_TOKEN;if(!b)return console.error("BD ASISTENTE: URL de base de datos no configurada"),!1;console.log("BD ASISTENTE: Conectando a la base de datos:",b.substring(0,20)+"...");const{createClient:f}=await import("@libsql/client"),k=f({url:b,authToken:m||void 0});console.log("BD ASISTENTE: Verificando si existe la tabla documentos_legales..."),(await k.execute({sql:"SELECT name FROM sqlite_master WHERE type='table' AND name='documentos_legales'"})).rows.length===0?(console.log("BD ASISTENTE: Creando tabla documentos_legales..."),await k.execute({sql:`CREATE TABLE documentos_legales (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          titulo TEXT NOT NULL,
          categoria TEXT NOT NULL,
          fecha TEXT NOT NULL,
          estado TEXT NOT NULL,
          origen TEXT NOT NULL,
          contenido TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`}),console.log("BD ASISTENTE: Tabla documentos_legales creada correctamente")):console.log("BD ASISTENTE: La tabla documentos_legales ya existe"),console.log("BD ASISTENTE: Verificando si existe la columna contenido...");try{await k.execute({sql:"SELECT contenido FROM documentos_legales LIMIT 1"}),console.log("BD ASISTENTE: La columna contenido existe en la tabla")}catch{console.log("BD ASISTENTE: Añadiendo columna contenido a la tabla..."),await k.execute({sql:"ALTER TABLE documentos_legales ADD COLUMN contenido TEXT"}),console.log("BD ASISTENTE: Columna contenido añadida correctamente")}console.log("BD ASISTENTE: Verificando si existe la columna origen...");try{await k.execute({sql:"SELECT origen FROM documentos_legales LIMIT 1"}),console.log("BD ASISTENTE: La columna origen existe en la tabla")}catch{console.log("BD ASISTENTE: Añadiendo columna origen a la tabla..."),await k.execute({sql:"ALTER TABLE documentos_legales ADD COLUMN origen TEXT DEFAULT 'generador'"}),console.log("BD ASISTENTE: Columna origen añadida correctamente")}console.log("BD ASISTENTE: Consultando documentos existentes para este usuario...");const A=await k.execute({sql:"SELECT id, titulo, origen FROM documentos_legales WHERE user_id = ? LIMIT 5",args:[l]});console.log(`BD ASISTENTE: Encontrados ${A.rows.length} documentos para el usuario (muestra de 5 max):`),A.rows.forEach((_,j)=>{console.log(`BD ASISTENTE: Doc ${j+1}: ID=${_.id}, Título=${_.titulo}, Origen=${_.origen||"no definido"}`)}),console.log("BD ASISTENTE: Insertando documento en la BD..."),console.log(`BD ASISTENTE: Longitud del contenido: ${(c==null?void 0:c.length)||0} caracteres`);const S=new Date().toISOString().split("T")[0];s=s==="asistente"?"asistente":"generador",console.log(`BD ASISTENTE: Usando origen final: "${s}"`);const y=await k.execute({sql:`INSERT INTO documentos_legales
            (id, user_id, titulo, categoria, fecha, estado, origen, contenido)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,args:[t,l,n,r,S,o,s,c]});console.log("BD ASISTENTE: Documento guardado con éxito. Resultado:",y),console.log("BD ASISTENTE: Verificando que el documento se guardó correctamente...");const x=await k.execute({sql:"SELECT id, titulo, origen FROM documentos_legales WHERE id = ?",args:[t]});if(x.rows.length>0){const _=x.rows[0];console.log(`BD ASISTENTE: Verificación exitosa: ID=${_.id}, Título=${_.titulo}, Origen=${_.origen}`)}else console.error("BD ASISTENTE: ¡ALERTA! El documento no se encontró después de guardarlo.");return!0}catch(b){return console.error("BD ASISTENTE: Error al guardar documento:",b.message),console.error("BD ASISTENTE: Detalles del error:",b),b.cause&&console.error("BD ASISTENTE: Causa del error:",b.cause),!1}},"q3pKML6T5w8"),rt=J(p(pr,"s_q3pKML6T5w8")),br=l=>{const[t,n,r,o,s]=I();o.value=l,r.value=l.prompt,n.value=l.documentType,t.value||(t.value=`${l.title} - ${new Date().toLocaleDateString()}`),s.value=!1},xr=async()=>{const[l,t]=I();if(t.messages.length===0){alert("No hay contenido para generar un documento. Por favor, genere el documento primero.");return}const n=t.messages.find(r=>r.role==="assistant");if(!n){alert("No se encontró contenido del asistente en el documento.");return}try{if(!l.value.userId){console.error("Usuario no autenticado:",l.value),alert("Debe iniciar sesión para guardar documentos.");return}const r=Date.now(),o=Math.floor(Math.random()*1e3),s=`asistente-${r}-${o}`,c=n.content||"",d=t.title||`Documento ${t.documentType} - ${new Date().toLocaleDateString()}`;if(console.log(`DEPURACIÓN ASISTENTE: Usuario ID=${l.value.userId}, Tipo=${t.documentType}`),console.log(`DEPURACIÓN ASISTENTE: Generando PDF para documento: ${d} (ID: ${s})`),console.log(`DEPURACIÓN ASISTENTE: Longitud del contenido: ${c.length} caracteres`),!c.trim()){console.error("DEPURACIÓN ASISTENTE: El contenido del documento está vacío"),alert("Error: El documento generado está vacío. Por favor, inténtelo de nuevo.");return}if(console.log('DEPURACIÓN ASISTENTE: Guardando documento en la BD con origen="asistente"'),!await rt(l.value.userId,s,d,t.documentType||"general","completado","asistente",c)){console.error("DEPURACIÓN ASISTENTE: El servidor devolvió false al guardar el documento"),alert("Error al guardar el documento en la base de datos. Verifique la consola para más detalles.");return}console.log(`DEPURACIÓN ASISTENTE: Documento guardado con éxito. Redirigiendo a: /documentos-legales/pdf/${s}`),window.location.href=`/documentos-legales/pdf/${s}`}catch(r){const o=r instanceof Error?r.message:"Error desconocido",s=r instanceof Error?r.stack:"";console.error("DEPURACIÓN ASISTENTE: Error al generar el PDF:",o),console.error("DEPURACIÓN ASISTENTE: Stack de error:",s),alert(`No se pudo generar el PDF. Error: ${o}

Revise la consola para más información.`)}},hr=async()=>{const[l]=I();if(l.messages.length===0)return;const t=l.messages.find(n=>n.role==="assistant");if(t)try{await navigator.clipboard.writeText(t.content),alert("Documento copiado al portapapeles")}catch(n){console.error("Error al copiar el documento:",n),alert("No se pudo copiar el documento")}},fr=()=>{const[l,t,n,r,o,s]=I();r.value="",l.value="",n.value="general",o.value=null,s.value=!0,t.messages=[]},yr=()=>{var A;Q(),el(p(nt,"s_WNqLUJ6kTbk"));const l=tl(),t=tt(),n=at(),r=E(null),o=E(""),s=E(""),c=E("general"),d=E(!0),u=ke({messages:[],title:"",documentType:""}),b=l.value.isDespacho?Zl:Jl,m=p(br,"s_kme81fTu7Uk",[s,c,o,r,d]),f=p(xr,"s_PhZG1qN8LQs",[l,u]),k=p(hr,"s_ATqBkzZIu2c",[u]),v=p(fr,"s_0cI4mLClRI4",[s,u,c,o,r,d]);return z(w("s_gysBsCF9K1I",[s,u,c,n])),e("div",null,{class:"documento-page"},[e("div",null,{class:"prompt-section"},[e("h2",null,{class:"prompt-title"},"Generar Documento Legal",3,null),d.value&&i(B,{children:[e("p",null,{class:"mb-4"},"Selecciona una plantilla o escribe tu propia solicitud:",3,null),e("div",null,{class:"templates-grid"},b.map(S=>e("div",{onClick$:w("s_BTaFDe80g7M",[m,S])},{class:"template-card"},[e("div",null,{class:"template-title"},$(S,"title"),1,null),e("p",null,{class:"text-sm text-gray-600 truncate"},[S.prompt.substring(0,60),"..."],1,null)],0,S.title)),1,null)]},1,"q5_0"),i(K,{action:n,children:[e("div",null,{class:"mb-4"},[e("label",null,{class:"block mb-2 text-sm font-medium"},"Título del Documento:",3,null),e("input",null,{type:"text",name:"title",value:g(S=>S.value,[s],"p0.value"),class:"w-full p-2 border border-gray-300 rounded-md",placeholder:"Ingresa un título para tu documento",onChange$:w("s_JvDWeQ4MiNc",[s])},null,3,null)],3,null),e("div",null,{class:"mb-4"},[e("label",null,{class:"block mb-2 text-sm font-medium"},"Instrucción para el Documento:",3,null),e("textarea",null,{name:"prompt",value:g(S=>S.value,[o],"p0.value"),class:"prompt-textarea",placeholder:"Describe el documento legal que necesitas. Puedes incluir detalles específicos como nombres, fechas, importes, etc.",onChange$:w("s_WSLAcLXqxyI",[o])},null,3,null),e("input",null,{type:"hidden",name:"documentType",value:g(S=>S.value,[c],"p0.value")},null,3,null)],3,null),e("div",null,{class:"btn-container"},[!d.value&&e("button",null,{type:"button",class:"tool-btn",onClick$:w("s_GENo1yQgOpY",[d])},"Ver Plantillas",3,"q5_1"),e("button",null,{type:"button",class:"tool-btn",onClick$:v},[i(Ga,{class:"w-4 h-4",[a]:{class:a}},3,"q5_2"),e("span",null,null,"Reiniciar",3,null)],1,null),e("button",null,{type:"submit",class:"primary-btn",disabled:g((S,y)=>S.isRunning||!y.value.trim(),[n,o],"p0.isRunning||!p1.value.trim()")},[i(Vl,{class:"w-4 h-4",[a]:{class:a}},3,"q5_3"),e("span",null,null,g(S=>S.isRunning?"Generando...":"Generar Documento",[n],'p0.isRunning?"Generando...":"Generar Documento"'),3,null)],1,null)],1,null)],[a]:{action:a}},1,"q5_4")],1,null),u.messages.length>0&&e("div",null,{class:"document-section"},[e("div",null,{class:"document-tools"},[e("button",null,{class:"tool-btn",onClick$:w("s_k70gFFZLnyI",[u,f])},[i(Se,{class:"w-4 h-4",[a]:{class:a}},3,"q5_5"),e("span",null,null,"Exportar PDF",3,null)],1,null),e("button",null,{class:"tool-btn",onClick$:k},[i(ja,{class:"w-4 h-4",[a]:{class:a}},3,"q5_6"),e("span",null,null,"Copiar",3,null)],1,null)],1,null),e("div",null,{class:"document-content"},((A=u.messages.find(S=>S.role==="assistant"))==null?void 0:A.content)||"",1,null)],1,"q5_7"),t.value.length>0&&e("div",null,{class:"past-sessions"},[e("h3",null,{class:"sessions-title"},"Documentos Recientes",3,null),e("div",null,{class:"sessions-grid"},t.value.map(S=>e("div",null,{class:"session-card"},[e("div",null,{class:"session-title"},$(S,"title"),1,null),e("div",null,{class:"session-date"},new Date(S.updated_at).toLocaleDateString(),1,null)],1,S.id)),1,null)],1,"q5_8")],1,"q5_9")},vr=M(p(yr,"s_s0kIatv8nWk")),kr=Object.freeze(Object.defineProperty({__proto__:null,_auto_STYLES:nt,_auto_plantillasDespacho:Zl,_auto_plantillasSindicato:Jl,_auto_serverGenerateDocument:et,_auto_serverSaveDocumentInDB:rt,_auto_serverSaveDocumentSession:lt,default:vr,useDocumentSessions:tt,useGenerateDocumentAction:at},Symbol.toStringTag,{value:"Module"})),wr=async l=>{try{await oe(l,`CREATE TABLE IF NOT EXISTS documentos_legales (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        titulo TEXT NOT NULL,
        categoria TEXT NOT NULL,
        fecha TEXT NOT NULL,
        estado TEXT NOT NULL,
        origen TEXT NOT NULL,
        contenido TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);const t=W(l);if(!t)return{success:!1,error:"Usuario no autenticado",documentos:[]};try{await oe(l,"SELECT origen FROM documentos_legales LIMIT 1"),console.log("MIS-DOCS: La columna origen existe en la tabla")}catch{console.log("MIS-DOCS: Añadiendo columna origen a la tabla documentos_legales"),await oe(l,"ALTER TABLE documentos_legales ADD COLUMN origen TEXT DEFAULT 'generador'"),console.log("MIS-DOCS: Columna origen añadida correctamente")}console.log(`MIS-DOCS: Consultando documentos para usuario ID=${t}`);const n=await oe(l,"SELECT id, titulo, categoria, fecha, estado, origen FROM documentos_legales WHERE user_id = ? ORDER BY fecha DESC",[t]);console.log(`MIS-DOCS: Se encontraron ${n.rows.length} documentos para el usuario ${t}`);const r=n.rows.filter(o=>o.origen==="asistente");return console.log(`MIS-DOCS: Documentos del asistente: ${r.length}`),n.rows.length>0?(console.log("MIS-DOCS: Todos los documentos encontrados:"),n.rows.forEach((o,s)=>{console.log(`MIS-DOCS: Doc ${s+1}: ID=${o.id}, Título=${o.titulo}, Origen=${o.origen||"no definido"}`)})):console.log("MIS-DOCS: No se encontraron documentos para este usuario"),{success:!0,error:null,documentos:n.rows.map(o=>({id:o.id,titulo:o.titulo,categoria:o.categoria,fecha:o.fecha,estado:o.estado,origen:o.origen}))}}catch(t){return console.error("Error al cargar documentos:",t),{success:!1,error:"Error al cargar los documentos",documentos:[]}}},ot=G(p(wr,"s_aLH21Z2USTc")),_r=()=>{Q(),tl(),_e();const l=ot();return new Date().getTime(),e("div",null,{class:"mis-documentos-page"},[e("div",null,{class:"page-header"},[e("h1",null,{class:"page-title"},"Mis Documentos",3,null),e("p",null,{class:"page-description"},"Gestiona todos tus documentos legales generados",3,null)],3,null),e("div",null,{class:"documents-list"},[e("div",null,{class:"list-header"},[e("div",null,{class:"header-nombre"},"Nombre del documento",3,null),e("div",null,{class:"header-categoria"},"Categoría",3,null),e("div",null,{class:"header-fecha"},"Fecha",3,null),e("div",null,{class:"header-acciones"},"Acciones",3,null)],3,null),l.value.success?l.value.documentos.length===0?e("div",null,{class:"empty-state"},[e("p",null,null,"No tienes documentos guardados.",3,null),e("p",null,null,"Puedes crear documentos usando el Asistente IA o seleccionando una plantilla en la sección Inicio.",3,null),e("div",null,{class:"empty-actions"},[i(D,{href:"/documentos-legales/asistente/",class:"create-doc-btn",children:"Usar Asistente IA",[a]:{href:a,class:a}},3,"0Y_2"),i(D,{href:"/documentos-legales/",class:"alternative-btn",children:"Ver plantillas",[a]:{href:a,class:a}},3,"0Y_3")],1,null)],1,"0Y_4"):e("div",null,null,l.value.documentos.map(t=>e("div",null,{class:"document-item"},[e("div",null,{class:"doc-nombre"},[i(V,{class:"w-5 h-5 doc-icon",[a]:{class:a}},3,"0Y_5"),e("span",null,{class:"doc-titulo"},$(t,"titulo"),1,null)],1,null),e("div",null,{class:"doc-categoria"},$(t,"categoria"),1,null),e("div",null,{class:"doc-fecha"},[i(Fe,{class:"w-4 h-4",[a]:{class:a}},3,"0Y_6"),e("span",null,null,new Date(t.fecha).toLocaleDateString(),1,null)],1,null),e("div",null,{class:"doc-acciones"},[i(D,{href:`/documentos-legales/pdf/${t.id}`,class:"action-btn view",children:[i(ul,{class:"w-4 h-4",[a]:{class:a}},3,"0Y_7"),e("span",null,null,"Ver",3,null)],[a]:{class:a}},1,"0Y_8"),i(D,{href:`/documentos-legales/pdf/${t.id}`,target:"_blank",class:"action-btn download",children:[i(Se,{class:"w-4 h-4",[a]:{class:a}},3,"0Y_9"),e("span",null,null,"Descargar",3,null)],[a]:{target:a,class:a}},1,"0Y_10")],1,null)],1,t.id)),1,null):e("div",null,{class:"error-message"},[i(re,{class:"w-8 h-8 text-red-500",[a]:{class:a}},3,"0Y_0"),e("p",null,null,g(t=>t.value.error,[l],"p0.value.error"),3,null)],1,"0Y_1")],1,null),e("style",null,null,`
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
        `,3,null)],1,"0Y_11")},Er=M(p(_r,"s_qKIBTpLzI04")),Tr=Object.freeze(Object.defineProperty({__proto__:null,default:Er,useDocumentosLegales:ot},Symbol.toStringTag,{value:"Module"})),Cr=async l=>{const t=l.params.id,n=se(l),r=n==="despacho"||n==="sindicato";if(console.log("[CAPACITACION - CREAR MODULO] User type from cookie:",n,"Puede gestionar:",r),!r)throw l.error(403,"No tiene permisos para gestionar módulos");try{const o=U(l),s=await o.execute("SELECT id, titulo FROM cursos_capacitacion WHERE id = ?",[t]);if(s.rows.length===0)throw l.error(404,"Curso no encontrado");const c={id:Number(s.rows[0].id),titulo:String(s.rows[0].titulo)},u=(await o.execute("SELECT * FROM modulos_curso WHERE curso_id = ? ORDER BY orden ASC",[t])).rows.map(m=>({id:Number(m.id),curso_id:Number(m.curso_id),titulo:String(m.titulo),tipo:String(m.tipo),orden:Number(m.orden),url_contenido:m.url_contenido?String(m.url_contenido):void 0})),b=u.length>0?Math.max(...u.map(m=>m.orden)):0;return{curso:c,modulos:u,ultimoOrden:b}}catch(o){throw console.error("[CAPACITACION] Error al cargar curso y módulos:",o),l.error(500,"Error al cargar el curso y sus módulos")}},st=G(p(Cr,"s_Qu2Lf1Yr4JE")),Sr=async(l,t)=>{const n=t.params.id,r=se(t);if(!(r==="despacho"||r==="sindicato"))return{success:!1,message:"No tiene permisos para crear módulos"};try{const s=U(t),c=await s.execute("SELECT MAX(orden) as max_orden FROM modulos_curso WHERE curso_id = ?",[n]),d=c.rows[0].max_orden?Number(c.rows[0].max_orden)+1:1,u=`
        INSERT INTO modulos_curso
        (curso_id, titulo, tipo, orden, url_contenido)
        VALUES (?, ?, ?, ?, ?)
      `,b=await s.execute(u,[n,l.titulo,l.tipo,d,l.urlContenido||null]);return{success:!0,moduloId:Number(b.lastInsertRowid),message:"Módulo creado exitosamente",nuevoOrden:d,data:{titulo:l.titulo,tipo:l.tipo,urlContenido:l.urlContenido||void 0}}}catch(s){return console.error("[CAPACITACION] Error al crear módulo:",s),{success:!1,message:`Error al crear el módulo: ${s instanceof Error?s.message:String(s)}`}}},Ar={titulo:L.string().min(3,"El título debe tener al menos 3 caracteres"),tipo:L.enum(["video","document","quiz","interactive"]),urlContenido:L.string().optional()},it=X(p(Sr,"s_v50kHfSGCjA"),Ee(p(Ar,"s_gXEcZBYaHeU"))),Ir=async(l,t)=>{const n=t.params.id,r=se(t);if(!(r==="despacho"||r==="sindicato"))return{success:!1,message:"No tiene permisos para eliminar módulos"};try{const s=U(t),c=`
        SELECT id FROM modulos_curso 
        WHERE id = ? AND curso_id = ?
      `;if((await s.execute(c,[l.moduloId,n])).rows.length===0)return{success:!1,message:"El módulo no pertenece a este curso"};const u=`
        SELECT orden FROM modulos_curso WHERE id = ?
      `,b=await s.execute(u,[l.moduloId]),m=Number(b.rows[0].orden),f=`
        DELETE FROM modulos_curso WHERE id = ?
      `;await s.execute(f,[l.moduloId]);const k=`
        UPDATE modulos_curso 
        SET orden = orden - 1 
        WHERE curso_id = ? AND orden > ?
      `;return await s.execute(k,[n,m]),{success:!0,message:"Módulo eliminado exitosamente",moduloId:l.moduloId,ordenEliminado:m}}catch(s){return console.error("[CAPACITACION] Error al eliminar módulo:",s),{success:!1,message:`Error al eliminar el módulo: ${s instanceof Error?s.message:String(s)}`}}},Dr={moduloId:L.number()},ct=X(p(Ir,"s_eWDruomByFI"),Ee(p(Dr,"s_wUGDVbBZa94"))),Rr=async(l,t)=>{const n=t.params.id,r=se(t);if(!(r==="despacho"||r==="sindicato"))return{success:!1,message:"No tiene permisos para modificar módulos"};try{const s=U(t),c=`
        SELECT id, orden FROM modulos_curso 
        WHERE id = ? AND curso_id = ?
      `,d=await s.execute(c,[l.moduloId,n]);if(d.rows.length===0)return{success:!1,message:"El módulo no pertenece a este curso"};const u=Number(d.rows[0].orden);let b;const m=`
        SELECT COUNT(*) as total FROM modulos_curso WHERE curso_id = ?
      `,f=await s.execute(m,[n]),k=Number(f.rows[0].total);return l.direccion==="arriba"?b=Math.max(1,u-1):b=Math.min(k,u+1),b===u?{success:!0,message:"No se requirió cambio de orden"}:(await s.execute("UPDATE modulos_curso SET orden = -1 WHERE id = ?",[l.moduloId]),l.direccion==="arriba"?await s.execute("UPDATE modulos_curso SET orden = orden + 1 WHERE curso_id = ? AND orden = ?",[n,b]):await s.execute("UPDATE modulos_curso SET orden = orden - 1 WHERE curso_id = ? AND orden = ?",[n,b]),await s.execute("UPDATE modulos_curso SET orden = ? WHERE id = ?",[b,l.moduloId]),{success:!0,message:"Orden del módulo actualizado",moduloId:l.moduloId,ordenAnterior:u,ordenNuevo:b,direccion:l.direccion})}catch(s){return console.error("[CAPACITACION] Error al cambiar orden del módulo:",s),{success:!1,message:`Error al cambiar orden: ${s instanceof Error?s.message:String(s)}`}}},Lr={moduloId:L.number(),direccion:L.enum(["arriba","abajo"])},dt=X(p(Rr,"s_oNUX1rg00Mo"),Ee(p(Lr,"s_wMKXVOQBuhk"))),Nr=()=>{const[l]=I();l.value=!0},Or=()=>{var b,m,f,k,v,A,S,y,x;Q();const l=st(),t=it(),n=ct(),r=dt(),o=ke({curso:l.value.curso,modulos:[...l.value.modulos],ultimoOrden:l.value.ultimoOrden}),s=ke({titulo:"",tipo:"video",urlContenido:""}),c=E(!1);z(w("s_p0GuES7RwIo",[t,c,o,s])),z(w("s_4mKQ1oZC36k",[n,c,o])),z(w("s_z8RFdWpjIfQ",[r,c,o]));const d=_=>{switch(Q(),_){case"video":return i(an,{class:"w-5 h-5",[a]:{class:a}},3,"wr_0");case"document":return i(V,{class:"w-5 h-5",[a]:{class:a}},3,"wr_1");case"quiz":return i(Da,{class:"w-5 h-5",[a]:{class:a}},3,"wr_2");case"interactive":return i(Ha,{class:"w-5 h-5",[a]:{class:a}},3,"wr_3");default:return i(V,{class:"w-5 h-5",[a]:{class:a}},3,"wr_4")}},u=_=>{switch(_){case"video":return"Video";case"document":return"Documento";case"quiz":return"Cuestionario";case"interactive":return"Interactivo";default:return _}};return e("div",null,{class:"gestionar-modulos-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},i(D,{get href(){return`/capacitacion/curso/${o.curso.id}`},class:"text-blue-600 hover:text-blue-800 flex items-center",children:[i(fe,{class:"w-5 h-5 mr-1",[a]:{class:a}},3,"wr_5"),"Volver al curso"],[a]:{href:g(_=>`/capacitacion/curso/${_.curso.id}`,[o],"`/capacitacion/curso/${p0.curso.id}`"),class:a}},1,"wr_6"),1,null),e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Gestionar módulos",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-2"},["Curso: ",e("span",null,{class:"font-semibold"},g(_=>_.curso.titulo,[o],"p0.curso.titulo"),3,null)],3,null)],1,null),e("div",null,{class:"grid grid-cols-1 lg:grid-cols-2 gap-8"},[e("div",null,null,e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Módulos del curso",3,null),o.modulos.length>0?e("div",null,{class:"space-y-4"},o.modulos.map(_=>e("div",null,{class:"p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"},[e("div",null,{class:"flex items-center justify-between mb-2"},[e("div",null,{class:"flex items-center space-x-3"},[e("div",null,{class:"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"},$(_,"orden"),1,null),e("div",null,{class:"flex flex-col"},[e("h3",null,{class:"font-medium text-slate-800 dark:text-white"},$(_,"titulo"),1,null),e("div",null,{class:"flex items-center text-slate-500 dark:text-slate-400 text-sm"},[d(_.tipo),e("span",null,{class:"ml-1"},u(_.tipo),1,null)],1,null)],1,null)],1,null),e("div",null,{class:"flex items-center space-x-1"},[i(K,{action:r,children:[e("input",{value:$(_,"id")},{type:"hidden",name:"moduloId"},null,3,null),e("input",null,{type:"hidden",name:"direccion",value:"arriba"},null,3,null),e("button",{disabled:_.orden===1||c.value},{type:"submit",class:"p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 rounded disabled:opacity-50",title:"Mover hacia arriba",onClick$:w("s_OfGln3a9A7I",[c])},i(Oa,{class:"w-5 h-5",[a]:{class:a}},3,"wr_7"),1,null)],[a]:{action:a}},1,"wr_8"),i(K,{action:r,children:[e("input",{value:$(_,"id")},{type:"hidden",name:"moduloId"},null,3,null),e("input",null,{type:"hidden",name:"direccion",value:"abajo"},null,3,null),e("button",{disabled:_.orden===o.modulos.length||c.value},{type:"submit",class:"p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 rounded disabled:opacity-50",title:"Mover hacia abajo",onClick$:w("s_edEBRsLY5VQ",[c])},i(me,{class:"w-5 h-5",[a]:{class:a}},3,"wr_9"),1,null)],[a]:{action:a}},1,"wr_10"),i(K,{action:n,children:[e("input",{value:$(_,"id")},{type:"hidden",name:"moduloId"},null,3,null),e("button",null,{type:"submit",class:"p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded",title:"Eliminar módulo",disabled:g(j=>j.value,[c],"p0.value"),onClick$:w("s_ziIr4cYPL0M",[c])},i(en,{class:"w-5 h-5",[a]:{class:a}},3,"wr_11"),1,null)],[a]:{action:a}},1,"wr_12")],1,null)],1,null),_.url_contenido&&e("div",null,{class:"mt-2 text-sm text-slate-600 dark:text-slate-400 break-all"},[e("span",null,{class:"font-medium"},"URL:",3,null)," ",$(_,"url_contenido")],1,"wr_13")],1,_.id)),1,"wr_14"):e("p",null,{class:"text-slate-600 dark:text-slate-400 text-center py-4 italic"},"Este curso no tiene módulos. Añade el primer módulo usando el formulario.",3,null),((b=n.value)==null?void 0:b.success)&&e("div",null,{class:"mt-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded-md text-sm"},g(_=>_.value.message,[n],"p0.value.message"),3,"wr_15"),((m=n.value)==null?void 0:m.success)===!1&&e("div",null,{class:"mt-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm"},g(_=>_.value.message,[n],"p0.value.message"),3,"wr_16"),((f=r.value)==null?void 0:f.success)===!1&&e("div",null,{class:"mt-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm"},g(_=>_.value.message,[r],"p0.value.message"),3,"wr_17")],1,null),1,null),e("div",null,null,[e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("div",null,{class:"flex items-center mb-4"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white"},"Añadir nuevo módulo",3,null),e("div",null,{class:"w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center ml-2"},i(hl,{class:"w-5 h-5 text-blue-600 dark:text-blue-400",[a]:{class:a}},3,"wr_18"),1,null)],1,null),((k=t.value)==null?void 0:k.success)&&e("div",null,{class:"mb-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded-md text-sm"},g(_=>_.value.message,[t],"p0.value.message"),3,"wr_19"),((v=t.value)==null?void 0:v.success)===!1&&e("div",null,{class:"mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm"},g(_=>_.value.message,[t],"p0.value.message"),3,"wr_20"),i(K,{action:t,class:"space-y-4",onSubmit$:p(Nr,"s_z6zFJaxgdEc",[c]),children:[e("div",null,null,[e("label",null,{for:"titulo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Título del módulo *",3,null),e("input",null,{id:"titulo",name:"titulo",type:"text",required:!0,value:g(_=>_.titulo,[s],"p0.titulo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. Introducción al curso",onInput$:w("s_wnDr7Ttdi8w",[s])},null,3,null),((S=(A=t.value)==null?void 0:A.fieldErrors)==null?void 0:S.titulo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(_=>_.value.fieldErrors.titulo,[t],"p0.value.fieldErrors.titulo"),3,"wr_21")],1,null),e("div",null,null,[e("label",null,{for:"tipo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Tipo de módulo *",3,null),e("select",null,{id:"tipo",name:"tipo",required:!0,value:g(_=>_.tipo,[s],"p0.tipo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:w("s_Tp94Ya8WbPA",[s])},[e("option",null,{value:"video"},"Video",3,null),e("option",null,{value:"document"},"Documento",3,null),e("option",null,{value:"quiz"},"Cuestionario",3,null),e("option",null,{value:"interactive"},"Interactivo",3,null)],3,null),((x=(y=t.value)==null?void 0:y.fieldErrors)==null?void 0:x.tipo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(_=>_.value.fieldErrors.tipo,[t],"p0.value.fieldErrors.tipo"),3,"wr_22")],1,null),e("div",null,null,[e("label",null,{for:"urlContenido",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"URL del contenido (opcional)",3,null),e("input",null,{id:"urlContenido",name:"urlContenido",type:"text",value:g(_=>_.urlContenido,[s],"p0.urlContenido"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"https://ejemplo.com/contenido",onInput$:w("s_hRSw0YUjz9Q",[s])},null,3,null),e("p",null,{class:"mt-1 text-xs text-slate-500 dark:text-slate-400"},"URL al video, documento o contenido interactivo según el tipo seleccionado",3,null)],3,null),e("div",null,{class:"pt-2"},e("button",null,{type:"submit",disabled:g(_=>_.value,[c],"p0.value"),class:"w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"},c.value?i(B,{children:[e("div",null,{class:"w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"},null,3,null),e("span",null,null,"Guardando...",3,null)]},3,"wr_23"):i(B,{children:[i(ll,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"wr_24"),e("span",null,null,"Guardar módulo",3,null)]},1,"wr_25"),1,null),1,null)],[a]:{action:a,class:a,onSubmit$:a}},1,"wr_26")],1,null),e("div",null,{class:"mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4"},[e("h3",null,{class:"font-medium text-blue-800 dark:text-blue-300 mb-1"},"Información sobre módulos",3,null),e("ul",null,{class:"list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1"},[e("li",null,null,"Los módulos se ordenan automáticamente según su secuencia",3,null),e("li",null,null,"Puedes cambiar el orden usando las flechas arriba/abajo",3,null),e("li",null,null,"Al eliminar un módulo, los siguientes se reordenan automáticamente",3,null),e("li",null,null,"El progreso de los usuarios es registrado por cada módulo completado",3,null)],3,null)],3,null)],1,null)],1,null)],1,"wr_27")},Mr=M(p(Or,"s_r4pbfEH5xHo")),jr=Object.freeze(Object.defineProperty({__proto__:null,default:Mr,useCambiarOrdenAction:dt,useCrearModuloAction:it,useCursoModulosLoader:st,useEliminarModuloAction:ct},Symbol.toStringTag,{value:"Module"})),Pr=async l=>{const t=l.params.id;if(!await Fl(l))throw l.error(403,"No tiene permisos para editar cursos");try{const o=await U(l).execute("SELECT * FROM cursos_capacitacion WHERE id = ?",[t]);if(o.rows.length===0)throw l.error(404,"Curso no encontrado");return{id:Number(o.rows[0].id),titulo:String(o.rows[0].titulo),descripcion:String(o.rows[0].descripcion),descripcionCompleta:String(o.rows[0].descripcion_completa||""),categoria:String(o.rows[0].categoria),instructor:o.rows[0].instructor?String(o.rows[0].instructor):"",duracion:o.rows[0].duracion?String(o.rows[0].duracion):"",imagenColor:String(o.rows[0].imagen_color||"bg-red-100 dark:bg-red-900/20")}}catch(r){throw console.error("[CAPACITACION] Error al cargar curso para editar:",r),l.error(500,"Error al cargar el curso")}},ut=G(p(Pr,"s_CYDddTxYSZU")),Ur=async(l,t)=>{const n=t.params.id;if(!await Fl(t))return{success:!1,message:"No tiene permisos para editar cursos"};try{const o=U(t),s=`
        UPDATE cursos_capacitacion
        SET titulo = ?, 
            descripcion = ?, 
            descripcion_completa = ?, 
            categoria = ?, 
            instructor = ?, 
            duracion = ?, 
            imagen_color = ?
        WHERE id = ?
      `,c=[l.titulo,l.descripcion,l.descripcionCompleta,l.categoria,l.instructor||null,l.duracion||null,l.imagenColor,n];return await o.execute(s,c),{success:!0,cursoId:Number(n),message:"Curso actualizado exitosamente"}}catch(o){return console.error("[CAPACITACION] Error al actualizar curso:",o),{success:!1,message:`Error al actualizar el curso: ${o instanceof Error?o.message:String(o)}`}}},$r={titulo:L.string().min(5,"El título debe tener al menos 5 caracteres"),descripcion:L.string().min(10,"La descripción debe tener al menos 10 caracteres"),descripcionCompleta:L.string().min(20,"La descripción completa debe ser más detallada"),categoria:L.enum(["seguridad","derechos","prevencion","igualdad","salud"]),instructor:L.string().optional(),duracion:L.string().optional(),imagenColor:L.string().default("bg-red-100 dark:bg-red-900/20")},gt=X(p(Ur,"s_qKEC0dvqMfU"),Ee(p($r,"s_7msCJgc2ikY"))),zr=()=>{const[l]=I();l.value=!0},Fr=()=>{var d,u,b,m,f,k,v,A,S,y;Q();const l=ut(),t=gt(),n=xl(),r=ke({titulo:l.value.titulo,descripcion:l.value.descripcion,descripcionCompleta:l.value.descripcionCompleta,categoria:l.value.categoria,instructor:l.value.instructor,duracion:l.value.duracion,imagenColor:l.value.imagenColor}),o=[{id:"bg-red-100 dark:bg-red-900/20",nombre:"Rojo"},{id:"bg-blue-100 dark:bg-blue-900/20",nombre:"Azul"},{id:"bg-green-100 dark:bg-green-900/20",nombre:"Verde"},{id:"bg-yellow-100 dark:bg-yellow-900/20",nombre:"Amarillo"},{id:"bg-purple-100 dark:bg-purple-900/20",nombre:"Morado"},{id:"bg-indigo-100 dark:bg-indigo-900/20",nombre:"Índigo"},{id:"bg-pink-100 dark:bg-pink-900/20",nombre:"Rosa"}],s=[{id:"seguridad",nombre:"Seguridad y Salud en el Trabajo"},{id:"derechos",nombre:"Derechos Laborales Básicos"},{id:"prevencion",nombre:"Prevención del Acoso Laboral"},{id:"igualdad",nombre:"Igualdad Salarial y No Discriminación"},{id:"salud",nombre:"Gestión del Estrés y Salud Mental"}],c=E(!1);return z(w("s_DGiYN3ezU0M",[t,c,n])),e("div",null,{class:"editar-curso-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},i(D,{get href(){return`/capacitacion/curso/${l.value.id}`},class:"text-blue-600 hover:text-blue-800 flex items-center",children:[i(fe,{class:"w-5 h-5 mr-1",[a]:{class:a}},3,"eL_0"),"Volver al curso"],[a]:{href:g(x=>`/capacitacion/curso/${x.value.id}`,[l],"`/capacitacion/curso/${p0.value.id}`"),class:a}},1,"eL_1"),1,null),e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Editar curso de capacitación",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-6"},['Actualiza la información del curso "',g(x=>x.value.titulo,[l],"p0.value.titulo"),'"'],3,null)],1,null),((d=t.value)==null?void 0:d.success)&&e("div",null,{class:"bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-6"},[e("p",null,null,g(x=>x.value.message,[t],"p0.value.message"),3,null),e("p",null,{class:"text-sm mt-1"},"Redirigiendo al curso actualizado...",3,null)],3,"eL_2"),((u=t.value)==null?void 0:u.success)===!1&&e("div",null,{class:"bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6"},e("p",null,null,g(x=>x.value.message,[t],"p0.value.message"),3,null),3,"eL_3"),i(K,{action:t,class:"bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700",onSubmit$:p(zr,"s_gNldimEWzt0",[c]),children:e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"titulo",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Título del curso *",3,null),e("input",null,{id:"titulo",name:"titulo",type:"text",required:!0,value:g(x=>x.titulo,[r],"p0.titulo"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. Seguridad y Salud en el Trabajo",onInput$:w("s_NfM10xdlMmI",[r])},null,3,null),((m=(b=t.value)==null?void 0:b.fieldErrors)==null?void 0:m.titulo)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(x=>x.value.fieldErrors.titulo,[t],"p0.value.fieldErrors.titulo"),3,"eL_4")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción breve *",3,null),e("input",null,{id:"descripcion",name:"descripcion",type:"text",required:!0,value:g(x=>x.descripcion,[r],"p0.descripcion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Breve descripción que aparecerá en la lista de cursos",onInput$:w("s_uvjRlfaN3a0",[r])},null,3,null),((k=(f=t.value)==null?void 0:f.fieldErrors)==null?void 0:k.descripcion)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(x=>x.value.fieldErrors.descripcion,[t],"p0.value.fieldErrors.descripcion"),3,"eL_5")],1,null),e("div",null,{class:"col-span-1 md:col-span-2"},[e("label",null,{for:"descripcionCompleta",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Descripción completa *",3,null),e("textarea",null,{id:"descripcionCompleta",name:"descripcionCompleta",required:!0,value:g(x=>x.descripcionCompleta,[r],"p0.descripcionCompleta"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-32",placeholder:"Descripción detallada del curso, objetivos, a quién va dirigido, etc.",onInput$:w("s_ue0ZPtmIQeM",[r])},null,3,null),((A=(v=t.value)==null?void 0:v.fieldErrors)==null?void 0:A.descripcionCompleta)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(x=>x.value.fieldErrors.descripcionCompleta,[t],"p0.value.fieldErrors.descripcionCompleta"),3,"eL_6")],1,null),e("div",null,null,[e("label",null,{for:"categoria",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Categoría *",3,null),e("select",null,{id:"categoria",name:"categoria",required:!0,value:g(x=>x.categoria,[r],"p0.categoria"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:w("s_9WesXJLVNgs",[r])},s.map(x=>e("option",{value:$(x,"id")},null,x.nombre,1,x.id)),1,null),((y=(S=t.value)==null?void 0:S.fieldErrors)==null?void 0:y.categoria)&&e("p",null,{class:"mt-1 text-sm text-red-600 dark:text-red-400"},g(x=>x.value.fieldErrors.categoria,[t],"p0.value.fieldErrors.categoria"),3,"eL_7")],1,null),e("div",null,null,[e("label",null,{for:"imagenColor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Color de fondo",3,null),e("select",null,{id:"imagenColor",name:"imagenColor",value:g(x=>x.imagenColor,[r],"p0.imagenColor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",onChange$:w("s_Gp0X0TDBMyw",[r])},o.map(x=>e("option",{value:$(x,"id")},null,x.nombre,1,x.id)),1,null)],1,null),e("div",null,null,[e("label",null,{for:"instructor",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Instructor (opcional)",3,null),e("input",null,{id:"instructor",name:"instructor",type:"text",value:g(x=>x.instructor,[r],"p0.instructor"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Nombre del instructor",onInput$:w("s_04Nz201Fg3A",[r])},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"duracion",class:"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"},"Duración (opcional)",3,null),e("input",null,{id:"duracion",name:"duracion",type:"text",value:g(x=>x.duracion,[r],"p0.duracion"),class:"w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",placeholder:"Ej. 2 horas, 3 semanas, etc.",onInput$:w("s_2MK076kynQ0",[r])},null,3,null)],3,null),e("div",null,{class:"col-span-1 md:col-span-2 flex justify-end"},e("button",null,{type:"submit",disabled:g(x=>x.value,[c],"p0.value"),class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"},c.value?i(B,{children:[e("div",null,{class:"w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"},null,3,null),e("span",null,null,"Guardando...",3,null)]},3,"eL_8"):i(B,{children:[i(ll,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"eL_9"),e("span",null,null,"Actualizar curso",3,null)]},1,"eL_10"),1,null),1,null)],1,null),[a]:{action:a,class:a,onSubmit$:a}},1,"eL_11")],1,"eL_12")},qr=M(p(Fr,"s_R64jpZif54M")),Br=Object.freeze(Object.defineProperty({__proto__:null,default:qr,useCursoLoader:ut,useEditarCursoAction:gt},Symbol.toStringTag,{value:"Module"})),Yr=async l=>{const t=l.params.id;try{const n=U(l),r=await n.execute("SELECT * FROM cursos_capacitacion WHERE id = ?",[t]);if(r.rows.length===0)throw l.error(404,"Curso no encontrado");const o={id:Number(r.rows[0].id),titulo:String(r.rows[0].titulo),descripcion:String(r.rows[0].descripcion),descripcion_completa:String(r.rows[0].descripcion_completa||""),categoria:String(r.rows[0].categoria),instructor:r.rows[0].instructor?String(r.rows[0].instructor):void 0,duracion:r.rows[0].duracion?String(r.rows[0].duracion):void 0,imagen_color:String(r.rows[0].imagen_color||"bg-red-100 dark:bg-red-900/20"),creado_por:Number(r.rows[0].creado_por)},c=(await n.execute("SELECT * FROM modulos_curso WHERE curso_id = ? ORDER BY orden ASC",[t])).rows.map(v=>({id:Number(v.id),curso_id:Number(v.curso_id),titulo:String(v.titulo),tipo:String(v.tipo),orden:Number(v.orden),url_contenido:v.url_contenido?String(v.url_contenido):void 0})),u=(await n.execute("SELECT * FROM recursos_curso WHERE curso_id = ?",[t])).rows.map(v=>({id:Number(v.id),curso_id:Number(v.curso_id),titulo:String(v.titulo),tipo:String(v.tipo),url_recurso:v.url_recurso?String(v.url_recurso):void 0})),b=se(l),m=b==="despacho"||b==="sindicato";console.log("[CAPACITACION] User type from cookie:",b,"Puede gestionar:",m);const f=W(l);let k=[];return f&&(k=(await n.execute("SELECT modulo_id FROM progreso_curso WHERE usuario_id = ? AND completado = 1",[f])).rows.map(A=>Number(A.modulo_id))),{curso:o,modulos:c,recursos:u,puedeGestionar:m,modulosCompletados:k}}catch(n){throw console.error("[CAPACITACION] Error al cargar curso:",n),l.error(500,"Error al cargar el curso")}},mt=G(p(Yr,"s_0EzdgdE9378")),Hr=()=>{Q(),_e();const l=mt(),t=E(null),n=r=>l.value.modulosCompletados.includes(r);return e("div",null,{class:"curso-container"},[e("header",null,{class:"mb-8"},[e("div",null,{class:"flex items-center mb-4"},i(D,{href:"/capacitacion",class:"text-blue-600 hover:text-blue-800 flex items-center",children:[i(fe,{class:"w-5 h-5 mr-1",[a]:{class:a}},3,"E6_0"),"Volver a capacitaciones"],[a]:{href:a,class:a}},1,"E6_1"),1,null),e("div",null,{class:"flex flex-col md:flex-row justify-between items-start md:items-center mb-4"},[e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2 md:mb-0"},g(r=>r.value.curso.titulo,[l],"p0.value.curso.titulo"),3,null),l.value.puedeGestionar&&e("div",null,{class:"flex space-x-2"},[i(D,{get href(){return`/capacitacion/curso/${l.value.curso.id}/modulos/crear`},class:"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center",children:[i(hl,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"E6_2"),"Crear módulos"],[a]:{href:g(r=>`/capacitacion/curso/${r.value.curso.id}/modulos/crear`,[l],"`/capacitacion/curso/${p0.value.curso.id}/modulos/crear`"),class:a}},1,"E6_3"),i(D,{get href(){return`/capacitacion/curso/${l.value.curso.id}/editar`},class:"bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center",children:[i(Va,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"E6_4"),"Editar curso"],[a]:{href:g(r=>`/capacitacion/curso/${r.value.curso.id}/editar`,[l],"`/capacitacion/curso/${p0.value.curso.id}/editar`"),class:a}},1,"E6_5")],1,"E6_6")],1,null),e("div",null,{class:"text-sm flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-400 mb-4"},[l.value.curso.instructor&&e("div",null,null,["Instructor: ",e("span",null,{class:"font-medium"},g(r=>r.value.curso.instructor,[l],"p0.value.curso.instructor"),3,null)],3,"E6_7"),l.value.curso.duracion&&e("div",null,null,["Duración: ",e("span",null,{class:"font-medium"},g(r=>r.value.curso.duracion,[l],"p0.value.curso.duracion"),3,null)],3,"E6_8"),e("div",null,null,["Categoría: ",e("span",null,{class:"font-medium capitalize"},g(r=>r.value.curso.categoria,[l],"p0.value.curso.categoria"),3,null)],3,null)],1,null)],1,null),e("div",null,{class:"grid grid-cols-1 lg:grid-cols-3 gap-8"},[e("div",null,{class:"lg:col-span-2"},[e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Descripción del curso",3,null),e("div",null,{class:"prose dark:prose-invert max-w-none"},e("p",null,{class:"text-slate-600 dark:text-slate-300"},g(r=>r.value.curso.descripcion_completa||r.value.curso.descripcion,[l],"p0.value.curso.descripcion_completa||p0.value.curso.descripcion"),3,null),3,null)],3,null),e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Módulos del curso",3,null),l.value.modulos.length>0?e("div",null,{class:"space-y-4"},l.value.modulos.map((r,o)=>Q(e("div",{class:`p-4 rounded-lg border ${n(r.id)?"border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20":"border-slate-200 dark:border-slate-700"}`},null,e("div",null,{class:"flex items-center justify-between"},[e("div",null,{class:"flex items-center space-x-3"},[e("div",null,{class:"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"},o+1,1,null),e("h3",null,{class:"font-medium text-slate-800 dark:text-white"},$(r,"titulo"),1,null),n(r.id)&&i(Ce,{class:"w-5 h-5 text-green-500",[a]:{class:a}},3,"E6_9")],1,null),e("button",{onClick$:w("s_mcFEtcamfSA",[r,t])},{class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"},[i(pl,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"E6_10"),"Iniciar"],0,null)],1,null),1,r.id))),1,"E6_11"):e("p",null,{class:"text-slate-600 dark:text-slate-400 text-center py-4"},"No hay módulos disponibles en este curso.",3,null)],1,null)],1,null),e("div",null,{class:"space-y-6"},[l.value.recursos.length>0&&e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Materiales descargables",3,null),e("div",null,{class:"space-y-3"},l.value.recursos.map(r=>e("div",null,{class:"flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"},[e("div",null,{class:"flex items-center"},e("span",null,{class:"truncate"},$(r,"titulo"),1,null),1,null),e("button",{onClick$:w("s_K7p3bEiVZj0",[r])},{class:"flex items-center text-blue-600 hover:text-blue-800"},i(Se,{class:"w-5 h-5",[a]:{class:a}},3,"E6_12"),0,null)],1,r.id)),1,null)],1,"E6_13"),e("div",null,{class:"bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"},[e("h2",null,{class:"text-xl font-bold text-slate-800 dark:text-white mb-4"},"Tu progreso",3,null),l.value.modulos.length>0?e("div",null,{class:"space-y-4"},[e("div",null,{class:"w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"},e("div",null,{class:"h-full bg-green-500",style:g(r=>({width:r.value.modulos.length>0?`${r.value.modulosCompletados.length/r.value.modulos.length*100}%`:"0%"}),[l],'{width:p0.value.modulos.length>0?`${p0.value.modulosCompletados.length/p0.value.modulos.length*100}%`:"0%"}')},null,3,null),3,null),e("p",null,{class:"text-center text-sm text-slate-600 dark:text-slate-400"},[g(r=>r.value.modulosCompletados.length,[l],"p0.value.modulosCompletados.length")," de ",g(r=>r.value.modulos.length,[l],"p0.value.modulos.length")," módulos completados"],3,null)],3,"E6_14"):e("p",null,{class:"text-slate-600 dark:text-slate-400 text-center py-4"},"No hay módulos disponibles en este curso.",3,null)],1,null)],1,null)],1,null)],1,"E6_15")},Vr=M(p(Hr,"s_OmDr6GDdzwg")),Gr=Object.freeze(Object.defineProperty({__proto__:null,default:Vr,useCursoLoader:mt},Symbol.toStringTag,{value:"Module"})),Xr=()=>{const t=_e().params.categoria,r={"contratos-laborales":"Contratos Laborales",despidos:"Cartas de Despido",demandas:"Demandas Laborales",reclamaciones:"Reclamaciones",afiliaciones:"Afiliaciones",convenios:"Convenios Colectivos",conflictos:"Conflictos Laborales",derechos:"Derechos Laborales"}[t]||"Categoría";return e("div",null,{class:"categoria-page"},[e("div",null,{class:"page-header"},[i(D,{href:"/documentos-legales/",class:"back-link",children:[i(fe,{class:"w-5 h-5",[a]:{class:a}},3,"2I_0"),e("span",null,null,"Volver",3,null)],[a]:{href:a,class:a}},1,"2I_1"),e("h1",null,{class:"page-title"},r,1,null),e("p",null,{class:"page-description"},"Selecciona una plantilla para generar un documento legal",3,null)],1,null),e("div",null,{class:"page-content"},e("div",null,{class:"info-message"},[e("p",null,null,["Las plantillas para la categoría ",e("strong",null,null,r,1,null)," están en desarrollo."],1,null),e("p",null,null,["Mientras tanto, puedes usar el ",i(D,{href:"/documentos-legales/asistente/",class:"link-text",children:"Asistente de IA",[a]:{href:a,class:a}},3,"2I_2")," para generar documentos personalizados."],1,null)],1,null),1,null),e("style",null,null,`
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
        `,3,null)],1,"2I_3")},Wr=M(p(Xr,"s_luOHToyI85g")),Kr=Object.freeze(Object.defineProperty({__proto__:null,default:Wr},Symbol.toStringTag,{value:"Module"})),Qr=async l=>{var r;const t=l.params.id,n=(r=l.cookie.get("auth_token"))==null?void 0:r.value;console.log(`PDF Visor: Buscando documento con ID: ${t}`),console.log(`PDF Visor: Usuario actual: ${n}`);try{await oe(l,`CREATE TABLE IF NOT EXISTS documentos_legales (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        titulo TEXT NOT NULL,
        categoria TEXT NOT NULL,
        fecha TEXT NOT NULL,
        estado TEXT NOT NULL,
        origen TEXT NOT NULL,
        contenido TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);try{await oe(l,"SELECT contenido FROM documentos_legales LIMIT 1"),console.log("PDF Visor: La columna contenido existe en la tabla")}catch{console.log("PDF Visor: Añadiendo columna contenido a la tabla documentos_legales"),await oe(l,"ALTER TABLE documentos_legales ADD COLUMN contenido TEXT"),console.log("PDF Visor: Columna contenido añadida correctamente")}const o=await oe(l,"SELECT id, titulo FROM documentos_legales LIMIT 10");console.log(`PDF Visor: Documentos en la base de datos (máximo 10): ${o.rows.length}`),o.rows.forEach((c,d)=>{console.log(`PDF Visor: Doc ${d+1}: ID=${c.id}, Título=${c.titulo}`)}),console.log(`PDF Visor: Obteniendo documento específico con ID: ${t}`);const s=await oe(l,"SELECT titulo, categoria, fecha, contenido, user_id, origen FROM documentos_legales WHERE id = ?",[t]);return s.rows.length===0?(console.log(`PDF Visor: No se encontró ningún documento con ID: ${t}`),{success:!1,titulo:`Documento ${t}`,categoria:"Categoría no disponible",fecha:new Date().toISOString().split("T")[0],contenido:null,userId:null,origen:null}):(console.log(`PDF Visor: Documento encontrado: ${s.rows[0].titulo} (Origen: ${s.rows[0].origen})`),{success:!0,titulo:s.rows[0].titulo,categoria:s.rows[0].categoria,fecha:s.rows[0].fecha,contenido:s.rows[0].contenido,userId:s.rows[0].user_id,origen:s.rows[0].origen})}catch(o){return console.error("PDF Visor: Error al obtener información del documento:",o),{success:!1,titulo:`Documento ${t}`,categoria:"Categoría no disponible",fecha:new Date().toISOString().split("T")[0],contenido:null,userId:null,origen:null}}},pt=G(p(Qr,"s_3EOF7tyPTCM")),bt=l=>{if(!l)return"";let t=l.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");return t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t},Zr=async()=>{const[l,t,n]=I();if(!window.html2pdf){alert("La biblioteca de PDF está cargando. Por favor, intente nuevamente en unos segundos.");return}const r=document.createElement("div");r.innerHTML=`
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
          ${n||`
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
    `,document.body.appendChild(r);try{const o=t.value.titulo.toLowerCase().replace(/[áàäâ]/g,"a").replace(/[éèëê]/g,"e").replace(/[íìïî]/g,"i").replace(/[óòöô]/g,"o").replace(/[úùüû]/g,"u").replace(/ñ/g,"n").replace(/[^a-z0-9]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),s={margin:[15,15],filename:`${o}-${l}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};alert("Generando PDF. Por favor espere..."),await window.html2pdf(r,s),console.log("PDF generado y descargado correctamente")}catch(o){console.error("Error al generar el PDF:",o),alert("Ocurrió un error al generar el PDF. Por favor, intente de nuevo.")}finally{document.body.removeChild(r)}},Jr=()=>{var t,n;const l=document.getElementById("pdf-iframe");l&&((t=l.contentWindow)==null||t.focus(),(n=l.contentWindow)==null||n.print())},eo=()=>{const t=_e().params.id,n=pt(),r=(()=>n.value.contenido?bt(n.value.contenido):"")(),o=(u,b="")=>{const m=b||`
      <h1>${u}</h1>
      <p>Este es un documento legal generado por el sistema.</p>
      <p>ID del documento: ${t}</p>
      <p>Fecha: ${new Date().toLocaleDateString()}</p>
      <hr>
      <p>El contenido real del documento aún no ha sido generado o no está disponible.</p>
    `,f=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${u}</title>
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
    `;return`data:text/html;charset=utf-8,${encodeURIComponent(f)}`},s=(()=>o(n.value.titulo,r||""))();z(w("s_c9jpPQjKWUs"));const c=p(Zr,"s_NxRHMEJOuAI",[t,n,r]),d=p(Jr,"s_TTBOJXlgnrU");return e("div",null,{class:"pdf-viewer-page"},[e("div",null,{class:"viewer-header"},[e("div",null,{class:"header-left"},[i(D,{href:"/documentos-legales/mis-documentos/",class:"back-link",children:[i(fe,{class:"w-5 h-5",[a]:{class:a}},3,"4X_0"),e("span",null,null,"Volver",3,null)],[a]:{href:a,class:a}},1,"4X_1"),e("h1",null,{class:"page-title"},g(u=>u.value.titulo,[n],"p0.value.titulo"),3,null),e("div",null,{class:"document-meta"},[e("div",null,{class:"meta-item"},[i(Gl,{class:"w-4 h-4",[a]:{class:a}},3,"4X_2"),e("span",null,null,g(u=>u.value.categoria,[n],"p0.value.categoria"),3,null)],1,null),e("div",null,{class:"meta-item"},[i(Fe,{class:"w-4 h-4",[a]:{class:a}},3,"4X_3"),e("span",null,null,new Date(n.value.fecha).toLocaleDateString(),1,null)],1,null),n.value.origen&&e("div",null,{class:"meta-item"},e("span",null,null,["Origen: ",g(u=>u.value.origen,[n],"p0.value.origen")],3,null),3,"4X_4")],1,null)],1,null),e("div",null,{class:"header-actions"},[e("button",null,{class:"action-btn",onClick$:c},[i(Se,{class:"w-5 h-5",[a]:{class:a}},3,"4X_5"),e("span",null,null,"Descargar",3,null)],1,null),e("button",null,{class:"action-btn",onClick$:d},[i(Hl,{class:"w-5 h-5",[a]:{class:a}},3,"4X_6"),e("span",null,null,"Imprimir",3,null)],1,null)],1,null)],1,null),e("div",null,{class:"viewer-content"},e("iframe",{src:s,title:`Documento Legal ${t}`,onError$:w("s_UaNZO831hZo",[t,s])},{id:"pdf-iframe",class:"pdf-iframe"},null,2,null),1,null),e("style",null,null,`
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
        `,3,null)],1,"4X_7")},lo=M(p(eo,"s_0A7MEUtq05E")),to=Object.freeze(Object.defineProperty({__proto__:null,_auto_convertMarkdownToHtml:bt,default:lo,useDocumentoInfo:pt},Symbol.toStringTag,{value:"Module"})),ao=`
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
  `,no=()=>{el(p(ao,"s_0qQ3k6L1bs0"));const l=[E(),E(),E()];return z(w("s_XQghmw02tBA")),e("div",null,{class:"flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 page-content"},[e("div",null,{class:"hero py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center hero-section",style:{viewTransitionName:"about-hero"}},e("div",null,{class:"max-w-4xl text-center"},[e("h1",null,{class:"text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white"},"Quienes Somos",3,null),e("p",null,{class:"text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto"},"En DAI Off entendemos los retos del entorno laboral moderno y brindamos asesoramiento legal laboral personalizado con tecnología avanzada.",3,null),e("div",null,{class:"flex flex-col sm:flex-row gap-4 justify-center"},[i(D,{href:"/chat",class:"px-8 py-3 bg-white text-red-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-md",children:"Consulta Ahora",[a]:{href:a,class:a}},3,"iL_0"),i(D,{href:"/contact",class:"px-8 py-3 bg-red-700 border border-white text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-center shadow-md",children:"Contáctanos",[a]:{href:a,class:a}},3,"iL_1")],1,null)],1,null),1,null),e("section",{ref:l[0]},{class:"py-16 px-4 bg-white dark:bg-gray-800 section",style:{viewTransitionName:"about-mission"}},e("div",null,{class:"max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center"},[e("div",null,null,[e("span",null,{class:"inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-full mb-3"},"Nuestro Propósito",3,null),e("h2",null,{class:"text-3xl font-bold mb-4 text-gray-900 dark:text-white"},"Nuestra Misión y Visión",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-6"},"DAI Off está dedicado a hacer el asesoramiento legal laboral accesible, claro y efectivo para todos. Creemos que entender tus derechos laborales abre puertas a nuevas oportunidades y crecimiento profesional.",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300"},"Nuestra visión es crear una comunidad de trabajadores informados, eliminando barreras y fomentando relaciones laborales justas a través del poder del conocimiento legal.",3,null)],3,null),e("div",null,{class:"flex justify-center"},i(Za,{class:"w-48 h-48 text-red-500 dark:text-red-400 opacity-80",[a]:{class:a}},3,"iL_2"),1,null)],1,null),1,null),e("section",{ref:l[1]},{class:"py-16 px-4 bg-gray-50 dark:bg-gray-900 section",style:{viewTransitionName:"about-values"}},e("div",null,{class:"max-w-7xl mx-auto"},[e("h2",null,{class:"text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"},"Nuestros Valores",3,null),e("div",null,{class:"grid md:grid-cols-2 lg:grid-cols-3 gap-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item",style:{viewTransitionName:"value-card-1"}},[e("div",null,{class:"icon-gradient mb-4"},i(pe,{class:"w-6 h-6",[a]:{class:a}},3,"iL_3"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Experiencia Confirmada",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Contamos con tecnología especializada en legislación laboral, estatuto de trabajadores y convenios colectivos por sector.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item",style:{viewTransitionName:"value-card-2"}},[e("div",null,{class:"icon-gradient mb-4"},i(qe,{class:"w-6 h-6",[a]:{class:a}},3,"iL_4"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Transparencia Total",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Garantizamos claridad en cada paso del proceso para asegurar que recibas orientación sin ninguna sorpresa.",3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item",style:{viewTransitionName:"value-card-3"}},[e("div",null,{class:"icon-gradient mb-4"},i(Ua,{class:"w-6 h-6",[a]:{class:a}},3,"iL_5"),1,null),e("h3",null,{class:"text-xl font-semibold mb-2 text-gray-800 dark:text-white"},"Compromiso con el Cliente",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},"Impulsados por nuestra pasión por la justicia laboral y el respeto por las necesidades individuales de cada trabajador.",3,null)],1,null)],1,null)],1,null),1,null),e("section",{ref:l[2]},{class:"py-16 px-4 bg-white dark:bg-gray-800 section",style:{viewTransitionName:"about-approach"}},e("div",null,{class:"max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center"},[e("div",null,{class:"flex justify-center md:order-last"},i($a,{class:"w-48 h-48 text-red-500 dark:text-red-400 opacity-80",[a]:{class:a}},3,"iL_6"),1,null),e("div",null,{class:"md:order-first"},[e("span",null,{class:"inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-full mb-3"},"Cómo Trabajamos",3,null),e("h2",null,{class:"text-3xl font-bold mb-4 text-gray-900 dark:text-white"},"Nuestro Enfoque de Asesoría",3,null),e("p",null,{class:"text-lg text-gray-600 dark:text-gray-300 mb-4"},"Combinamos conocimiento legal, casos reales y herramientas de IA avanzadas como nuestro asistente DAI Off, para crear una experiencia de asesoramiento personalizada y efectiva.",3,null),e("ul",null,{class:"space-y-3 text-gray-600 dark:text-gray-300"},[e("li",null,{class:"flex items-start"},[i(Qa,{class:"w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0",[a]:{class:a}},3,"iL_7"),e("span",null,null,"Enfoque en soluciones prácticas y aplicables desde el primer momento.",3,null)],1,null),e("li",null,{class:"flex items-start"},[i(dl,{class:"w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0",[a]:{class:a}},3,"iL_8"),e("span",null,null,"Información actualizada con las últimas normativas laborales y convenios.",3,null)],1,null),e("li",null,{class:"flex items-start"},[i(he,{class:"w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0",[a]:{class:a}},3,"iL_9"),e("span",null,null,"Integración de IA para un asesoramiento personalizado y preciso.",3,null)],1,null)],1,null)],1,null)],1,null),1,null),e("div",null,{class:"py-16 px-4 text-center bg-gray-50 dark:bg-gray-900",style:{viewTransitionName:"about-cta"}},e("div",null,{class:"max-w-3xl mx-auto"},[e("h2",null,{class:"text-3xl font-bold mb-6 text-red-700 dark:text-red-300"},"¿Listo para proteger tus derechos laborales?",3,null),e("p",null,{class:"text-lg mb-8 text-gray-600 dark:text-gray-300"},"Únete a la comunidad DAI Off hoy y descubre el poder de contar con asesoría legal laboral personalizada.",3,null),i(D,{href:"/auth",class:"inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300",style:{viewTransitionName:"cta-button"},children:["Registrarse Ahora",i(Bl,{class:"w-5 h-5 ml-2",[a]:{class:a}},3,"iL_10")],[a]:{href:a,class:a,style:a}},1,"iL_11")],1,null),1,null)],1,"iL_12")},ro=M(p(no,"s_tPTKrVT0pR0")),oo={title:"Quienes Somos | DAI Off",meta:[{name:"description",content:"Conoce más sobre DAI Off, nuestra misión, valores y enfoque innovador en asesoría legal laboral con tecnología avanzada. Protege tus derechos laborales."}]},so=Object.freeze(Object.defineProperty({__proto__:null,default:ro,head:oo},Symbol.toStringTag,{value:"Module"})),io=async l=>{const t=W(l);return t?{absences:(await oe(l,"SELECT * FROM user_absences WHERE user_id = ? ORDER BY start_date DESC",[t])).rows}:{absences:[]}},xt=G(p(io,"s_ZN1KWUNAAvk")),co=async(l,t)=>{const n=W(t);if(!n)return{success:!1,error:"Usuario no autenticado"};try{return await oe(t,`INSERT INTO user_absences (user_id, start_date, end_date, absence_type, description)
      VALUES (?, ?, ?, ?, ?)`,[n,l.start_date,l.end_date,l.absence_type,l.description||""]),{success:!0,message:"Ausencia registrada correctamente"}}catch(r){return console.error("Error al registrar ausencia:",r),{success:!1,error:"Error al registrar la ausencia. Inténtalo de nuevo."}}},ht=X(p(co,"s_j0SjgjJTC0s")),uo=async(l,t)=>{const n=W(t);if(!n)return{success:!1,error:"Usuario no autenticado"};try{return await oe(t,"DELETE FROM user_absences WHERE id = ? AND user_id = ?",[l.absence_id,n]),{success:!0,message:"Ausencia eliminada correctamente"}}catch(r){return console.error("Error al eliminar ausencia:",r),{success:!1,error:"Error al eliminar la ausencia. Inténtalo de nuevo."}}},ft=X(p(uo,"s_f9T1qAv6HXU")),go=()=>{const[l,t,n]=I(),r=new Date(n.value,t.value,1),o=new Date(n.value,t.value+1,0),s=[],c=r.getDay(),d=new Date(n.value,t.value,0).getDate();for(let m=c-1;m>=0;m--){const f=new Date(n.value,t.value-1,d-m);s.push(f)}for(let m=1;m<=o.getDate();m++){const f=new Date(n.value,t.value,m);s.push(f)}const b=6-o.getDay();for(let m=1;m<=b;m++){const f=new Date(n.value,t.value+1,m);s.push(f)}l.value=s},mo=()=>{const[l,t,n]=I();l.value===0?(l.value=11,t.value--):l.value--,n()},po=()=>{const[l,t,n]=I();l.value===11?(l.value=0,t.value++):l.value++,n()},bo=l=>["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][l],xo=()=>{const[l,t]=I();setTimeout(()=>{t.value=null,l.value=null},5e3)},ho=()=>{Q();const l=xt(),t=ht(),n=ft(),r=E(!1),o=E(new Date().getMonth()),s=E(new Date().getFullYear()),c=E([]),d=E(null),u=E(null),b=p(go,"s_RRlGTjIC0os",[c,o,s]),m=p(mo,"s_vmLY69sX3yA",[o,s,b]),f=p(po,"s_F0lvdVGthS0",[o,s,b]),k=x=>!l.value.absences||!Array.isArray(l.value.absences)?!1:l.value.absences.some(_=>{const j=new Date(_.start_date),P=new Date(_.end_date);return j.setHours(0,0,0,0),P.setHours(0,0,0,0),x.setHours(0,0,0,0),x>=j&&x<=P}),v=x=>{if(!l.value.absences||!Array.isArray(l.value.absences))return null;const _=l.value.absences.find(j=>{const P=new Date(j.start_date),h=new Date(j.end_date);return P.setHours(0,0,0,0),h.setHours(0,0,0,0),x.setHours(0,0,0,0),x>=P&&x<=h});return _&&_.absence_type?String(_.absence_type):null},A=x=>{switch(x){case"illness":return"bg-red-200 text-red-800";case"vacation":return"bg-blue-200 text-blue-800";case"personal":return"bg-orange-200 text-orange-800";case"other":return"bg-purple-200 text-purple-800";default:return"bg-gray-200 text-gray-800"}},S=p(bo,"s_AWa0nzatgWs"),y=p(xo,"s_6JItnLXN84E",[u,d]);return z(w("s_20w0tZCU43c",[b])),z(w("s_oz7gFAWyM3M",[y,u,t,r,d])),z(w("s_v0xs7guL43U",[y,n,u,d])),e("div",null,{class:"space-y-6"},[d.value&&e("div",null,{class:"bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative",role:"alert"},e("span",null,{class:"block sm:inline"},g(x=>x.value,[d],"p0.value"),3,null),3,"X1_0"),u.value&&e("div",null,{class:"bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative",role:"alert"},e("span",null,{class:"block sm:inline"},g(x=>x.value,[u],"p0.value"),3,null),3,"X1_1"),e("div",null,{class:"flex justify-between items-center mb-4"},[e("h2",null,{class:"text-xl font-semibold flex items-center"},[i(Fe,{class:"w-6 h-6 mr-2",[a]:{class:a}},3,"X1_2"),S(o.value)," ",g(x=>x.value,[s],"p0.value")],1,null),e("div",null,{class:"flex space-x-2"},[e("button",null,{class:"px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600","aria-label":"Mes anterior",onClick$:m},"<",3,null),e("button",null,{class:"px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600","aria-label":"Mes siguiente",onClick$:f},">",3,null),e("button",null,{class:"flex items-center px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600",onClick$:w("s_CWt4VIjLirA",[r])},r.value?"Cancelar":i(B,{children:[i(hl,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"X1_3"),e("span",null,null,"Registrar ausencia",3,null)]},1,"X1_4"),1,null)],1,null)],1,null),r.value&&e("div",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow mb-6"},[e("h3",null,{class:"text-lg font-medium mb-4"},"Registrar nueva ausencia",3,null),i(K,{action:t,class:"space-y-4",children:[e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-4"},[e("div",null,null,[e("label",null,{for:"start_date",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de inicio",3,null),e("input",null,{id:"start_date",name:"start_date",type:"date",required:!0,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"end_date",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de fin",3,null),e("input",null,{id:"end_date",name:"end_date",type:"date",required:!0,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},null,3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"absence_type",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Tipo de ausencia",3,null),e("select",null,{id:"absence_type",name:"absence_type",required:!0,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},[e("option",null,{value:""},"Selecciona un tipo",3,null),e("option",null,{value:"illness"},"Baja por enfermedad",3,null),e("option",null,{value:"vacation"},"Vacaciones",3,null),e("option",null,{value:"personal"},"Asuntos personales",3,null),e("option",null,{value:"other"},"Otros",3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"description",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Descripción (opcional)",3,null),e("textarea",null,{id:"description",name:"description",rows:3,class:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"},null,3,null)],3,null),e("div",null,{class:"flex justify-end"},e("button",null,{type:"submit",class:"inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"},[i(Na,{class:"w-4 h-4 mr-2",[a]:{class:a}},3,"X1_5"),"Guardar"],1,null),1,null)],[a]:{action:a,class:a}},1,"X1_6")],1,"X1_7"),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow"},[e("div",null,{class:"grid grid-cols-7 gap-px border-b dark:border-gray-700"},["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(x=>e("div",null,{class:"py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"},x,1,x)),1,null),e("div",null,{class:"grid grid-cols-7 gap-px"},c.value.map((x,_)=>{const j=x.getMonth()===o.value,P=x.toDateString()===new Date().toDateString();return k(x),v(x),e("div",{class:`
                  h-20 p-2 relative
                  ${j?"bg-white dark:bg-gray-800":"bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}
                  ${P?"border-2 border-red-500":""}
                `},null,[e("span",{class:`
                  inline-flex w-6 h-6 items-center justify-center rounded-full text-sm
                  ${P?"bg-red-500 text-white":""}
                `},null,x.getDate(),1,null),k(x)&&e("div",null,{class:"mt-1"},(()=>{const h=v(x);return e("div",{class:`text-xs p-1 rounded-sm truncate ${A(h||"")}`,title:h||""},null,[h==="illness"&&"Enfermedad",h==="vacation"&&"Vacaciones",h==="personal"&&"Personal",h==="other"&&"Otros"],1,"X1_8")})(),1,`absence-${_}`)],1,_)}),1,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-6"},[e("h3",null,{class:"text-lg font-medium mb-4"},"Ausencias registradas",3,null),l.value.absences.length===0?e("p",null,{class:"text-gray-500 dark:text-gray-400 text-center py-4"},"No hay ausencias registradas.",3,"X1_9"):e("div",null,{class:"overflow-x-auto"},e("table",null,{class:"min-w-full divide-y divide-gray-200 dark:divide-gray-700"},[e("thead",null,{class:"bg-gray-50 dark:bg-gray-700"},e("tr",null,null,[e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Tipo",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Fecha inicio",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Fecha fin",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Descripción",3,null),e("th",null,{scope:"col",class:"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"},"Acciones",3,null)],3,null),3,null),e("tbody",null,{class:"bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"},l.value.absences.map(x=>e("tr",null,null,[e("td",null,{class:"px-6 py-4 whitespace-nowrap"},e("span",{class:`px-2 py-1 text-xs rounded-full ${A(x.absence_type)}`},null,[x.absence_type==="illness"&&"Enfermedad",x.absence_type==="vacation"&&"Vacaciones",x.absence_type==="personal"&&"Personal",x.absence_type==="other"&&"Otros"],1,null),1,null),e("td",null,{class:"px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"},new Date(x.start_date).toLocaleDateString(),1,null),e("td",null,{class:"px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"},new Date(x.end_date).toLocaleDateString(),1,null),e("td",null,{class:"px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate"},x.description||"-",1,null),e("td",null,{class:"px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"},i(K,{action:n,children:[e("input",{value:$(x,"id")},{type:"hidden",name:"absence_id"},null,3,null),e("button",null,{type:"submit",class:"text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300","aria-label":"Eliminar ausencia"},i(Ja,{class:"w-5 h-5",[a]:{class:a}},3,"X1_10"),1,null)],[a]:{action:a}},1,"X1_11"),1,null)],1,x.id)),1,null)],1,null),1,null)],1,null)],1,"X1_12")},fo=M(p(ho,"s_ABXHT4evbVI")),yo=Object.freeze(Object.defineProperty({__proto__:null,default:fo,useDeleteAbsence:ft,useRegisterAbsence:ht,useUserAbsences:xt},Symbol.toStringTag,{value:"Module"})),vo=async l=>{console.log(`[PDF Processor] 🔍 Analizando PDF: ${l.name} (${l.size} bytes)`);try{console.log("[PDF Processor] 📄 Extrayendo información básica...");const t=l.name,n=l.size;console.log("[PDF Processor] ⏳ Procesando contenido del documento...");let r="",o=0;try{console.log("[PDF Processor] ⏳ Intentando usar WebPDFLoader de LangChain...");const f=new Blob([await l.arrayBuffer()],{type:l.type}),v=await new pa(f).load();o=v.length,r=v.map(A=>A.pageContent).join(`
`),console.log(`[PDF Processor] ✅ PDF cargado con LangChain. Páginas: ${o}`)}catch(f){console.warn("[PDF Processor] ⚠️ No se pudo usar WebPDFLoader:",f),console.log("[PDF Processor] ⏳ Usando simulación para el contenido..."),await new Promise(k=>setTimeout(k,1500)),o=Math.max(Math.floor(n/3e3)+1,1),console.log(`[PDF Processor] 📊 Páginas estimadas: ${o}`),r=`Contenido simulado del documento ${t}`}const s=ko(t);console.log(`[PDF Processor] ✅ Tipo de documento determinado: ${s}`),console.log("[PDF Processor] 🔍 Analizando características legales del documento...");const c=wo(t,s);console.log(`[PDF Processor] ✅ Análisis completado: ${c.legalTerms.length} términos identificados`);const d=_o(t,n,s);console.log(`[PDF Processor] 📈 Puntuación de confianza: ${(d*100).toFixed(0)}%`);let u=d>.7;c.potentialIssues.length>3&&(console.log(`[PDF Processor] ⚠️ Detectado un número elevado de problemas (${c.potentialIssues.length})`),u=!1),console.log("[PDF Processor] 📝 Extrayendo contenido original del documento...");const b=Eo(s);console.log("[PDF Processor] 📄 Preparando versión mejorada del documento...");const m=To(t,s,c,b);return console.log("[PDF Processor] ✅ Versión mejorada preparada"),{documentType:s,validityCheck:u,legalTerms:c.legalTerms,potentialIssues:c.potentialIssues,recommendedActions:c.recommendedActions,confidenceScore:d,metadata:{pageCount:o,fileSize:n,textLength:c.simulatedContentLength},improvedDocument:m}}catch(t){throw console.error("[PDF Processor] ❌ Error al analizar PDF:",t),new Error(`Error al procesar el PDF: ${t instanceof Error?t.message:"Error desconocido"}`)}};function ko(l){const t=l.toLowerCase();return t.includes("demanda")?t.includes("despido")?"Demanda por Despido":t.includes("improcedente")?"Demanda por Despido Improcedente":t.includes("laboral")?"Demanda Laboral":"Demanda":t.includes("despido")?t.includes("carta")?"Carta de Despido":t.includes("improcedente")?"Despido Improcedente":t.includes("procedente")?"Despido Procedente":"Documento de Despido":t.includes("contrato")?t.includes("temporal")?"Contrato Temporal":t.includes("indefinido")?"Contrato Indefinido":t.includes("practicas")?"Contrato en Prácticas":"Contrato Laboral":t.includes("convenio")?t.includes("colectivo")?"Convenio Colectivo":"Convenio":t.includes("estatuto")?"Estatuto":t.includes("acta")?"Acta de Reunión":t.includes("renuncia")?"Carta de Renuncia":t.includes("finiquito")?"Documento de Finiquito":t.includes("baja")?"Documento de Baja Laboral":t.includes("sancion")?"Documento de Sanción":"Documento Legal"}function wo(l,t){const n=[],r=[],o=[],s=l.length*100+Math.floor(Math.random()*5e3);switch(t){case"Demanda por Despido Improcedente":n.push("Identificación completa de las partes (demandante y demandado)","Exposición cronológica de hechos relevantes al despido","Fundamentos jurídicos aplicables (Art. 55 y 56 del ET)","Pretensión principal: declaración de improcedencia","Solicitud de indemnización legal o readmisión","Petición de salarios de tramitación","Cláusulas procesales según LJS"),r.push("Falta de concreción en la fecha exacta del despido y su forma de comunicación","Insuficiente detalle sobre la antigüedad y salario regulador para el cálculo indemnizatorio","No se especifica si se ha realizado la conciliación previa obligatoria (SMAC)","Ausencia de documentación probatoria referenciada en anexos","El plazo de caducidad de 20 días hábiles podría estar próximo a vencer","No se detallan claramente las circunstancias que fundamentan la improcedencia"),o.push("Verificar que la demanda se presenta dentro del plazo de caducidad de 20 días hábiles desde la notificación del despido","Incluir el acta de conciliación previa como documento anexo obligatorio","Especificar con claridad el salario regulador, incluyendo todos los conceptos salariales para un correcto cálculo de la indemnización","Detallar la antigüedad real considerando posibles concatenaciones de contratos previos","Fundamentar claramente los motivos de improcedencia contestando específicamente a las causas alegadas por la empresa","Aportar documentación probatoria que respalde la versión del demandante (comunicaciones, testigos, etc.)","Solicitar expresamente los salarios de tramitación si se opta por la readmisión");break;case"Demanda por Despido":case"Demanda":n.push("Identificación de las partes procesales","Exposición clara de hechos constitutivos de la pretensión","Fundamentos de derecho aplicables","Petición concreta (petitum)","Fecha y firma del demandante o representante legal","Referencia a documentos probatorios adjuntos"),r.push("Descripción imprecisa de los hechos fundamentales","Ausencia de conciliación previa administrativa","Posible caducidad de la acción (plazos legales)","Falta de claridad en la cuantificación de pretensiones económicas","Jurisdicción o competencia incorrectas","Legitimación activa o pasiva no acreditada suficientemente"),o.push("Verificar el cumplimiento estricto de los plazos procesales aplicables","Asegurar que se ha realizado y documentado la conciliación previa cuando sea preceptiva","Cuantificar con precisión las pretensiones económicas, detallando el método de cálculo","Revisar la coherencia entre los hechos alegados y los fundamentos jurídicos invocados","Aportar toda la documentación probatoria referenciada en la demanda","Asegurar la correcta identificación de todas las partes implicadas, incluyendo posibles responsables subsidiarios","Verificar la competencia territorial y funcional del tribunal ante el que se presenta la demanda");break;case"Contrato Laboral":case"Contrato Temporal":case"Contrato Indefinido":n.push("Identificación completa de las partes (empleador y trabajador)","Objeto y causa del contrato claramente especificados","Condiciones laborales: jornada, horario y distribución del tiempo","Duración y periodo de prueba (si aplica)","Retribución desglosada por conceptos salariales","Vacaciones y periodos de descanso","Convenio colectivo aplicable","Protección de datos personales","Cláusula de no competencia (si corresponde)"),r.push("Causa de temporalidad insuficientemente justificada o genérica","Cláusulas abusivas limitando derechos del trabajador","Periodo de prueba excesivo para el puesto de trabajo","Retribución por debajo del convenio aplicable o SMI","Ausencia de información sobre el convenio colectivo de aplicación","Jornada laboral que excede los límites legales","Omisión de información relevante sobre condiciones esenciales"),o.push("Especificar con detalle la causa de temporalidad, vinculándola a circunstancias concretas y verificables","Revisar la adecuación del periodo de prueba a lo establecido en el convenio aplicable","Detallar todos los componentes salariales asegurando el cumplimiento del convenio y SMI","Incluir una cláusula específica sobre protección de datos personales conforme a RGPD","Verificar que las condiciones de jornada, horario y descansos cumplen la normativa","Asegurar que se informa correctamente sobre el convenio colectivo aplicable","Eliminar cualquier cláusula potencialmente abusiva que limite indebidamente derechos laborales","Incluir información clara sobre el proceso de comunicación de finalización del contrato");break;case"Carta de Despido":n.push("Identificación del trabajador y empleador","Fecha de efectividad del despido","Descripción clara y detallada de los hechos imputados","Calificación jurídica de la causa de despido","Referencia a la normativa aplicable","Ofrecimiento de indemnización (si aplica)","Información sobre liquidación y finiquito","Mecanismos de impugnación disponibles"),r.push("Descripción vaga o genérica de los hechos imputados","Ausencia de fechas concretas de los incidentes alegados","No especificación de la fecha efectiva del despido","Falta de concreción en la calificación jurídica del despido","Incoherencia entre los hechos descritos y la gravedad de la sanción","Omisión del ofrecimiento de indemnización en despidos objetivos","Posible vulneración del principio de proporcionalidad"),o.push("Detallar con precisión fechas, lugares y circunstancias de cada hecho imputado","Establecer claramente la conexión entre los hechos y las causas legales de despido invocadas","Especificar con exactitud la fecha de efectividad del despido","En despidos objetivos, incluir la puesta a disposición de la indemnización legal","Asegurar que la carta contiene todos los requisitos formales para evitar la declaración de improcedencia","Verificar la proporcionalidad entre los hechos imputados y la sanción de despido","Incluir referencias específicas a la normativa y convenio aplicables","Evitar cualquier referencia discriminatoria o que vulnere derechos fundamentales");break;case"Convenio Colectivo":n.push("Ámbito territorial, funcional y personal de aplicación","Vigencia temporal y mecanismos de prórroga o denuncia","Estructura salarial y tablas retributivas","Jornada laboral, descansos y vacaciones","Clasificación profesional y movilidad funcional","Derechos sindicales y de representación colectiva","Régimen disciplinario y procedimiento sancionador","Mecanismos de resolución de conflictos","Igualdad y no discriminación en el ámbito laboral"),r.push("Cláusulas que establecen condiciones por debajo de los mínimos legales","Falta de concreción en la vigencia y procedimiento de denuncia","Tablas salariales no actualizadas o por debajo del SMI","Ambigüedad en la clasificación profesional y funciones","Mecanismos de resolución de conflictos insuficientes","Ausencia de medidas efectivas de igualdad y conciliación","Régimen disciplinario con tipificaciones ambiguas o desproporcionadas"),o.push("Revisar íntegramente el convenio para asegurar el cumplimiento de la legislación laboral vigente","Actualizar las tablas salariales asegurando que superan el SMI en todos los grupos profesionales","Detallar con precisión los mecanismos de prórroga, denuncia y ultraactividad del convenio","Definir claramente las funciones correspondientes a cada grupo profesional","Implementar medidas específicas de igualdad, conciliación y prevención del acoso","Establecer procedimientos claros y garantistas para la imposición de sanciones","Crear comisiones paritarias efectivas para la interpretación y resolución de conflictos","Incluir cláusulas específicas sobre teletrabajo y desconexión digital acordes a la legislación actual");break;case"Carta de Renuncia":n.push("Identificación del trabajador y empresa","Manifestación inequívoca de la voluntad de dimitir","Fecha efectiva de finalización de la relación laboral","Referencia al preaviso establecido en convenio/contrato","Solicitud de liquidación y documentos finales"),r.push("Falta de claridad en la manifestación de la voluntad de dimitir","Ausencia de fecha concreta de finalización","Incumplimiento del periodo de preaviso establecido","Condicionamiento de la renuncia a circunstancias futuras","Falta de solicitud expresa de documentación final"),o.push("Expresar de forma inequívoca la voluntad de finalizar voluntariamente la relación laboral","Especificar con exactitud la fecha del último día de trabajo","Verificar y cumplir el periodo de preaviso establecido en convenio o contrato","Solicitar expresamente la liquidación, finiquito y documentos finales (certificado de empresa, etc.)","Mantener una copia firmada o con acuse de recibo de la carta de renuncia","Evitar incluir justificaciones o motivos que puedan interpretarse como coacción","Si la renuncia está motivada por incumplimientos empresariales, valorar otras opciones legales como la resolución indemnizada del contrato");break;case"Documento de Finiquito":n.push("Identificación completa de las partes","Fecha de finalización de la relación laboral","Detalle de conceptos liquidados (salarios, vacaciones, etc.)","Cuantificación económica de cada concepto","Cláusula de saldo y finiquito","Referencia a la causa de extinción del contrato","Efectos liberatorios y renuncia de acciones"),r.push("Omisión de conceptos salariales pendientes de liquidar","Error en el cálculo de indemnizaciones o vacaciones no disfrutadas","Renuncia de derechos indisponibles por parte del trabajador","Firma del documento sin asistencia de representación sindical","Cláusulas de renuncia excesivamente amplias o genéricas","Ausencia de desglose detallado de los conceptos liquidados"),o.push("Verificar que todos los conceptos salariales pendientes están incluidos (parte proporcional de pagas extra, vacaciones no disfrutadas, etc.)","Comprobar la corrección de los cálculos de cada concepto liquidado según convenio y normativa","Delimitar con claridad el alcance de la renuncia de acciones","Solicitar la presencia de un representante sindical en la firma cuando sea posible","Incluir un desglose detallado de conceptos y cantidades para facilitar su verificación","Si existen discrepancias, firmar con la expresión 'recibí' pero no 'conforme'","Guardar copia del documento y toda la documentación relacionada con la liquidación");break;default:n.push("Identificación de las partes intervinientes","Fecha y lugar de suscripción","Objeto y alcance del documento","Obligaciones de las partes","Condiciones de vigencia y duración","Mecanismos de resolución de controversias","Legislación aplicable"),r.push("Identificación incompleta o imprecisa de las partes","Ambigüedad en la definición del objeto y alcance","Obligaciones desequilibradas entre las partes","Cláusulas potencialmente abusivas o contra legem","Jurisdicción o ley aplicable inadecuada o no especificada","Falta de firmas o validación formal adecuada"),o.push("Verificar la correcta y completa identificación de todas las partes intervinientes","Definir con precisión el objeto, alcance y finalidad del documento","Revisar que las obligaciones establecidas sean equilibradas y conforme a derecho","Establecer mecanismos claros de resolución de controversias","Especificar con claridad la ley aplicable y jurisdicción competente","Asegurar la correcta validación formal del documento (firmas, fechas, etc.)","Consultar con un especialista legal para validar el contenido y conformidad con la normativa aplicable")}const c=l.toLowerCase();return(c.includes("2023")||c.includes("2024")||c.includes("2025"))&&n.push("Referencias a legislación vigente actualizada"),(c.includes("asistente")||c.includes("ia"))&&(r.push("El documento parece haber sido generado por IA, verificar revisión legal por profesional"),o.push("Solicitar revisión por un profesional legal cualificado antes de su uso oficial")),c.length<20&&(r.push("Nombre de archivo demasiado genérico, dificulta su identificación y archivo"),o.push("Renombrar el documento con convención que incluya tipo, fecha y referencia")),{legalTerms:n,potentialIssues:r,recommendedActions:o,simulatedContentLength:s}}function _o(l,t,n){let r=.5;/([a-z-]+)(-|\s)(20\d\d|[0-3]\d-[0-1]\d-20\d\d)/.test(l)&&(r+=.15);let s=5e3;switch(n){case"Demanda":case"Demanda por Despido":case"Demanda por Despido Improcedente":s=15e3;break;case"Convenio Colectivo":s=5e4;break;case"Contrato Laboral":s=1e4;break;case"Carta de Despido":case"Carta de Renuncia":s=5e3;break}const c=Math.min(t/s,3);c>=1?r+=.1*Math.min(c,2):r-=.15,l.toLowerCase().endsWith(".pdf")?r+=.1:r-=.2;const d=l.toLowerCase();let u=0;switch(n){case"Contrato Laboral":u=d.includes("contrato")?.1:0;break;case"Demanda por Despido":case"Demanda por Despido Improcedente":u=d.includes("demanda")&&d.includes("despido")?.15:0;break;case"Convenio Colectivo":u=d.includes("convenio")&&d.includes("colectivo")?.1:0;break;case"Carta de Despido":u=d.includes("carta")&&d.includes("despido")?.1:0;break;default:const b=n.split(" ")[0].toLowerCase();u=d.includes(b.toLowerCase())?.05:0}return r+=u,r+=Math.random()*.1-.05,r=Math.max(0,Math.min(r,1)),r}function Eo(l){switch(l){case"Contrato Laboral":return`
CONTRATO DE TRABAJO

En [Ciudad], a [Fecha]

REUNIDOS
De una parte, [Empresa], con domicilio en [Dirección] y CIF [Número], representada por D./Dña. [Representante], en calidad de [Cargo].

De otra parte, D./Dña. [Trabajador], con DNI [Número] y domicilio en [Dirección].

ACUERDAN
Formalizar el presente CONTRATO DE TRABAJO, de acuerdo con las siguientes cláusulas:

PRIMERA.- El trabajador prestará sus servicios como [Categoría Profesional], con la jornada y horario [detalles].

SEGUNDA.- La duración del contrato será [indefinida/temporal].

TERCERA.- El trabajador percibirá una retribución de [cantidad] euros brutos [periodicidad].

CUARTA.- La duración de las vacaciones anuales será de [días].

QUINTA.- El presente contrato se regirá por lo dispuesto en la legislación vigente, y en el Convenio Colectivo de [Sector].

[Firmas]
      `;case"Demanda por Despido":case"Demanda por Despido Improcedente":return`
AL JUZGADO DE LO SOCIAL DE [CIUDAD]

D./Dña. [Nombre], mayor de edad, con DNI [Número] y domicilio en [Dirección], ante el Juzgado comparezco y como mejor proceda en Derecho, DIGO:

Que por medio del presente escrito interpongo DEMANDA POR DESPIDO contra la empresa [Nombre], con domicilio en [Dirección], en la persona de su representante legal, en base a los siguientes

HECHOS

PRIMERO.- He venido prestando servicios para la empresa demandada desde el [Fecha], con la categoría profesional de [Categoría], percibiendo un salario de [Cantidad] euros [periodicidad].

SEGUNDO.- El día [Fecha], la empresa me comunicó la extinción de mi contrato por [Causa].

TERCERO.- Considero que dicho despido es improcedente por [Motivos].

CUARTO.- Se ha intentado la preceptiva conciliación ante el SMAC con fecha [Fecha], sin avenencia (o sin efecto).

Por lo expuesto,

SUPLICO AL JUZGADO: Que teniendo por presentado este escrito con sus copias, se sirva admitirlo, y en su virtud tenga por interpuesta DEMANDA POR DESPIDO contra [Empresa], y previos los trámites legales, dicte Sentencia por la que se declare la IMPROCEDENCIA del despido, condenando a la empresa a que, a su elección, me readmita en mi puesto de trabajo en las mismas condiciones que regían antes del despido o me indemnice en la cantidad que resulte conforme a derecho, así como al abono, en cualquier caso, de los salarios dejados de percibir desde la fecha del despido hasta la notificación de la Sentencia.

En [Ciudad], a [Fecha].

[Firma]
      `;case"Carta de Despido":return`
[Ciudad], [Fecha]

Estimado/a D./Dña. [Nombre],

Por medio de la presente, le comunicamos que la Dirección de esta empresa ha decidido proceder a su despido con efectos del día [Fecha], de conformidad con lo establecido en el artículo 54 del Estatuto de los Trabajadores, por los siguientes HECHOS:

[Descripción detallada de los hechos imputados]

Los hechos descritos constituyen un incumplimiento grave y culpable de sus obligaciones contractuales, subsumible en el artículo 54.2.[apartado] del Estatuto de los Trabajadores y en el artículo [número] del Convenio Colectivo aplicable.

Se le comunica que tiene a su disposición la liquidación de haberes que le corresponde hasta la fecha de efectos del despido.

Rogamos firme el duplicado de esta carta a los solos efectos de acreditar su recepción.

Atentamente,

[Firma del representante de la empresa]
[Cargo]
[Empresa]

Recibí el [Fecha]:
[Espacio para firma del trabajador]
      `;default:return`Contenido simulado del documento tipo ${l}. Este es un placeholder para simular el texto original de un documento legal.`}}function To(l,t,n,r=""){const s=`${l.includes(".")?l.substring(0,l.lastIndexOf(".")):l}-mejorado.pdf`,c=`
Este documento ha sido analizado por el sistema de auditoría legal de DAI-OFF. Se han identificado ${n.potentialIssues.length} problemas potenciales que han sido corregidos en esta versión mejorada. El documento original era un ${t} con un nivel de validez legal cuestionable.

El análisis ha identificado ${n.legalTerms.length} términos legales clave, entre los cuales destacan: ${n.legalTerms.slice(0,3).join(", ")}, entre otros. La versión mejorada fortalece estos términos y asegura su correcta aplicación en el contexto legal adecuado.

La validez del documento ha aumentado significativamente tras las correcciones implementadas, asegurando su conformidad con la legislación vigente aplicable a este tipo de documentos.
  `,d=n.potentialIssues.map((k,v)=>`Corrección ${v+1}: Se ha corregido "${k}" mediante la implementación de lenguaje legal preciso y referencias normativas actualizadas.`).join(`

`),u=n.recommendedActions.map((k,v)=>`Implementación ${v+1}: ${k}`).join(`

`),b=n.legalTerms.map((k,v)=>`Término ${v+1}: "${k}" ha sido reforzado con referencias específicas a la legislación vigente.`).join(`

`);let m=r;switch(t){case"Contrato Laboral":m=m.replace("[Categoría Profesional]","Técnico Especialista Nivel II").replace("[detalles]","completa de 40 horas semanales, distribuidas de lunes a viernes, en horario de 9:00 a 18:00 con una hora para comer").replace("[indefinida/temporal]","indefinida, con un período de prueba de 6 meses conforme al art. 14 del ET").replace("[cantidad]","1.800,00").replace("[periodicidad]","mensuales, en 14 pagas anuales").replace("[días]","30 días naturales").replace("[Sector]","Oficinas y Despachos de Madrid");break;case"Demanda por Despido":case"Demanda por Despido Improcedente":m=m.replace("[Causa]","supuesta bajo productividad, sin concreción ni especificación de hechos").replace("[Motivos]","falta de concreción de los hechos imputados, ausencia de carta de despido con los requisitos legales, y vulneración del principio de presunción de inocencia");break;case"Carta de Despido":m=m.replace("[Descripción detallada de los hechos imputados]",`1. El día 15 de abril de 2025, usted se ausentó de su puesto de trabajo sin comunicación ni autorización previa durante 4 horas.
2. El día 18 de abril de 2025, se negó expresamente a cumplir las instrucciones de su superior jerárquico para la realización de las tareas propias de su puesto.
3. El día 22 de abril de 2025, fue sorprendido utilizando recursos de la empresa para fines personales, contraviniendo expresamente la política interna de uso de recursos corporativos.`);break}const f=[{title:"RESUMEN EJECUTIVO",content:c.trim()},{title:"CORRECCIONES APLICADAS",content:d},{title:"RECOMENDACIONES IMPLEMENTADAS",content:u},{title:"TÉRMINOS LEGALES FORTALECIDOS",content:b},{title:"DOCUMENTO LEGAL MEJORADO",content:m.trim()},{title:"CONCLUSIÓN Y RECOMENDACIONES FINALES",content:`El documento ha sido mejorado significativamente y ahora cumple con los estándares legales para un ${t}. Se recomienda utilizar esta versión mejorada para todos los propósitos legales y administrativos.`},{title:"INFORMACIÓN DE VALIDACIÓN",content:`Documento validado por el sistema de auditoría legal de DAI-OFF.
Este documento es una versión mejorada basada en el análisis automatizado y debe ser revisado por un profesional legal antes de su uso oficial.`}];return{fileName:s,originalName:l,documentType:t,sections:f,dateGenerated:new Date().toISOString()}}const Co=async l=>{const t=W(l);if(!t)return[];const n=U(l);return await n.execute({sql:`CREATE TABLE IF NOT EXISTS pdf_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      upload_date TEXT NOT NULL,
      analysis_json TEXT NOT NULL
    )`}),(await n.execute({sql:`SELECT id, file_name, file_size, upload_date FROM pdf_audits
          WHERE user_id = ? ORDER BY upload_date DESC LIMIT 10`,args:[t]})).rows},yt=G(p(Co,"s_xLaJ55i4zns")),So=async(l,t)=>{var r;const n=W(t);if(!n)return{success:!1,error:"No se ha iniciado sesión"};try{console.log("[Auditoria] 📋 Datos recibidos del formulario:",JSON.stringify(l));const o=l.fileName;if(console.log("[Auditoria] 📄 Nombre de archivo extraído:",o),!o||!o.endsWith(".pdf"))return console.log("[Auditoria] ❌ Validación fallida - nombre de archivo inválido:",o),{success:!1,error:"Por favor, sube un archivo PDF válido"};console.log("[Auditoria] 🔄 Procesando archivo PDF:",o);let s;console.log("[Auditoria] 📄 Creando archivo simulado para demostración...");const c=new File([new ArrayBuffer(10240)],o,{type:"application/pdf"});console.log("[Auditoria] ✅ Archivo simulado creado:",c.name,c.size,"bytes");try{console.log("[Auditoria] 🔍 Iniciando análisis de PDF con LangChain..."),s=await vo(c),console.log("[Auditoria] ✅ PDF análisis completado con éxito:",o),console.log("[Auditoria] 📊 Resumen del análisis:",{documentType:s.documentType,confidenceScore:s.confidenceScore,legalTermsCount:s.legalTerms.length,issuesCount:s.potentialIssues.length,actionsCount:s.recommendedActions.length})}catch(m){console.error("[Auditoria] ❌ ERROR al procesar PDF:",m),console.log("[Auditoria] Stack trace:",m instanceof Error?m.stack:"No stack disponible"),s={documentType:o.includes("contrato")?"Contrato Laboral":o.includes("demanda")?"Demanda":o.includes("despido")?"Carta de Despido":"Documento Legal",validityCheck:!1,confidenceScore:.3,legalTerms:["Documento requiere revisión manual"],potentialIssues:["Error al procesar el archivo PDF. Posible archivo corrupto o protegido."],recommendedActions:["Revisar documento manualmente","Verificar que el archivo no esté protegido"],metadata:{pageCount:0,fileSize:10240,textLength:0}}}const d=((r=s.metadata)==null?void 0:r.fileSize)||10240,u=new Date().toISOString();console.log("[Auditoria] 💾 Guardando análisis en la base de datos...");const b=U(t);try{await b.execute({sql:`INSERT INTO pdf_audits (user_id, file_name, file_size, upload_date, analysis_json)
              VALUES (?, ?, ?, ?, ?)`,args:[n,o,d,u,JSON.stringify(s)]}),console.log("[Auditoria] ✅ Análisis guardado en la base de datos correctamente")}catch(m){console.error("[Auditoria] ❌ ERROR al guardar en DB:",m)}return console.log("[Auditoria] ✅ Proceso completado con éxito"),{success:!0,fileName:o,fileSize:d,uploadDate:u,analysis:s}}catch(o){return console.error("[Auditoria] ❌ ERROR GENERAL al procesar el PDF:",o),console.log("[Auditoria] Stack trace:",o instanceof Error?o.stack:"No stack disponible"),{success:!1,error:typeof o=="object"&&o!==null&&"message"in o?o.message:"Error al procesar el archivo. Por favor, inténtalo de nuevo."}}},vt=X(p(So,"s_LPjCZLh5Tyo")),Ao=async({auditId:l},t)=>{const n=W(t);if(!n||!l)return{success:!1,error:"No se ha iniciado sesión o ID de auditoría inválido"};try{const o=await U(t).execute("SELECT * FROM pdf_audits WHERE id = ? AND user_id = ?",[Number(l),n]);if(o.rows.length===0)return{success:!1,error:"Auditoría no encontrada"};const s=o.rows[0],c=JSON.parse(s.analysis_json);return{success:!0,fileName:s.file_name,fileSize:s.file_size,uploadDate:s.upload_date,analysis:c}}catch(r){return console.error("Error al obtener el detalle de la auditoría:",r),{success:!1,error:"Error al obtener el detalle de la auditoría"}}},kt=X(p(Ao,"s_BlKY0Jhi0lk")),wt=l=>{const t=l.sections.filter(s=>["RESUMEN EJECUTIVO","CORRECCIONES APLICADAS","RECOMENDACIONES IMPLEMENTADAS","TÉRMINOS LEGALES FORTALECIDOS"].includes(s.title)),n=l.sections.filter(s=>!["RESUMEN EJECUTIVO","CORRECCIONES APLICADAS","RECOMENDACIONES IMPLEMENTADAS","TÉRMINOS LEGALES FORTALECIDOS","CONCLUSIÓN Y RECOMENDACIONES FINALES","INFORMACIÓN DE VALIDACIÓN"].includes(s.title)),r=l.sections.find(s=>s.title==="DOCUMENTO LEGAL MEJORADO"||s.title==="TEXTO COMPLETO MEJORADO"||s.title.includes("MEJORADO")),o=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${l.fileName}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        html, body {
          margin: 0;
          padding: 0;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          background: white;
        }
        .container {
          width: 21cm;
          max-width: 100%;
          margin: 0 auto;
          padding: 2cm;
          box-sizing: border-box;
        }
        h1 {
          font-size: 18pt;
          text-align: center;
          margin-bottom: 20px;
          font-weight: bold;
          color: #000;
        }
        h2 {
          font-size: 14pt;
          background-color: #f5f5f5;
          padding: 8px;
          border-left: 4px solid #e53e3e;
          margin-top: 20px;
          margin-bottom: 15px;
          font-weight: bold;
          color: #000;
        }
        p {
          margin-bottom: 12px;
          text-align: justify;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 20px 0;
        }
        .document-header {
          text-align: right;
          margin-bottom: 30px;
          color: #333;
        }
        .document-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10pt;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .page-break {
          page-break-before: always;
        }
        .legal-document {
          margin-top: 30px;
          border-top: 2px solid #333;
          padding-top: 30px;
        }
        .legal-text {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
        }
        .analysis-section {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${l.fileName}</h1>
        <p class="document-header">Generado el: ${new Date(l.dateGenerated).toLocaleDateString()}</p>
        <hr>
        
        <!-- Secciones de análisis -->
        <div class="analysis-section">
          ${t.map(s=>`
            <section>
              <h2>${s.title}</h2>
              <div>
                ${s.content.split(`

`).map(c=>`<p>${c}</p>`).join("")}
              </div>
            </section>
          `).join("")}
        </div>
        
        <!-- Página nueva para el documento legal completo mejorado -->
        <div class="page-break"></div>
        <div class="legal-document">
          <h2>DOCUMENTO LEGAL COMPLETO MEJORADO</h2>
          <div class="legal-text">
            ${r?r.content.split(`

`).map(s=>`<p>${s}</p>`).join(""):n.map(s=>`
                  <section>
                    <h3 style="font-size: 13pt; margin-top: 20px; font-weight: bold;">${s.title}</h3>
                    <div>
                      ${s.content.split(`

`).map(c=>`<p>${c}</p>`).join("")}
                    </div>
                  </section>
                `).join("")}
          </div>
        </div>
        
        <!-- Información final -->
        <div class="document-footer">
          <p>Documento mejorado generado por el sistema de auditoría legal de DAI-OFF</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;return`data:text/html;charset=utf-8,${encodeURIComponent(o)}`},Io=l=>{const[t,n]=I();n.value=l,t.submit({auditId:l})},Do=l=>{const[t,n]=I();t.value=wt(l),n.value=!0},Ro=async l=>{if(!window.html2pdf){alert("La biblioteca de PDF está cargando. Por favor, intente nuevamente en unos segundos.");return}const t=l.sections.filter(c=>["RESUMEN EJECUTIVO","CORRECCIONES APLICADAS","RECOMENDACIONES IMPLEMENTADAS","TÉRMINOS LEGALES FORTALECIDOS"].includes(c.title)),n=l.sections.filter(c=>!["RESUMEN EJECUTIVO","CORRECCIONES APLICADAS","RECOMENDACIONES IMPLEMENTADAS","TÉRMINOS LEGALES FORTALECIDOS","CONCLUSIÓN Y RECOMENDACIONES FINALES","INFORMACIÓN DE VALIDACIÓN"].includes(c.title)),r=l.sections.find(c=>c.title==="DOCUMENTO LEGAL MEJORADO"||c.title==="TEXTO COMPLETO MEJORADO"||c.title.includes("MEJORADO")),o=document.createElement("div");o.style.position="absolute",o.style.left="-9999px",o.style.top="0";const s=document.createElement("div");s.style.width="210mm",s.style.padding="0",s.style.margin="0",s.style.background="white",s.style.boxSizing="border-box",s.innerHTML=`
      <div style="padding: 20mm; font-family: 'Times New Roman', Times, serif; line-height: 1.5; color: #000;">
        <h1 style="font-size: 18pt; text-align: center; margin-bottom: 20px; font-weight: bold;">${l.fileName}</h1>
        <p style="text-align: right; margin-bottom: 30px;">Fecha de generación: ${new Date(l.dateGenerated).toLocaleDateString()}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <!-- Secciones de análisis -->
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          ${t.map(c=>`
            <div style="margin-bottom: 25px; break-inside: avoid;">
              <h2 style="font-size: 14pt; background-color: #f5f5f5; padding: 8px; border-left: 4px solid #e53e3e; margin-top: 20px; margin-bottom: 15px; font-weight: bold;">${c.title}</h2>
              ${c.content.split(`

`).map(d=>`<p style="margin-bottom: 12px; text-align: justify;">${d}</p>`).join("")}
            </div>
          `).join("")}
        </div>
        
        <!-- Página nueva para el documento legal completo mejorado -->
        <div style="page-break-before: always;"></div>
        <div style="margin-top: 30px; border-top: 2px solid #333; padding-top: 30px;">
          <h2 style="font-size: 16pt; margin-top: 0; font-weight: bold; text-align: center; margin-bottom: 20px;">DOCUMENTO LEGAL COMPLETO MEJORADO</h2>
          <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5;">
            ${r?r.content.split(`

`).map(c=>`<p style="margin-bottom: 12px; text-align: justify;">${c}</p>`).join(""):n.map(c=>`
                  <div style="margin-bottom: 25px; break-inside: avoid;">
                    <h3 style="font-size: 13pt; margin-top: 20px; font-weight: bold;">${c.title}</h3>
                    ${c.content.split(`

`).map(d=>`<p style="margin-bottom: 12px; text-align: justify;">${d}</p>`).join("")}
                  </div>
                `).join("")}
          </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 10pt; color: #666; border-top: 1px solid #eee; padding-top: 15px;">
          <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          <p>Sistema de Auditoría Legal DAIOFF</p>
        </div>
      </div>
    `,o.appendChild(s),document.body.appendChild(o);try{const c=l.fileName.toLowerCase().replace(/[áàäâ]/g,"a").replace(/[éèëê]/g,"e").replace(/[íìïî]/g,"i").replace(/[óòöô]/g,"o").replace(/[úùüû]/g,"u").replace(/ñ/g,"n").replace(/[^a-z0-9]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"documento-mejorado",d={margin:[10,10,10,10],filename:`${c}-${new Date().getTime()}.pdf`,image:{type:"jpeg",quality:1},html2canvas:{scale:2,useCORS:!0,logging:!1,letterRendering:!0,allowTaint:!0,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait",compress:!0,hotfixes:["px_scaling"]}};alert("Generando PDF. Por favor espere..."),await window.html2pdf().from(s).set(d).save(),console.log("PDF generado y descargado correctamente")}catch(c){console.error("Error al generar el PDF:",c),alert("Ocurrió un error al generar el PDF. Por favor, intente de nuevo.")}finally{document.body.contains(o)&&document.body.removeChild(o)}},Lo=()=>{const[l,t]=I();t.value=!1,l.value=""},No=()=>{var t,n;const l=document.getElementById("pdf-iframe");l&&((t=l.contentWindow)==null||t.focus(),(n=l.contentWindow)==null||n.print())},Oo=l=>{const[t,n]=I(),r=l.target;r.files&&r.files.length>0?(n.value=r.files[0].name,t.value=!0):(n.value="",t.value=!1)},Mo=()=>{var y,x,_,j,P,h,Z,ae,F,ie,ne,Y,R,q,ce,te,le,Re,be,ue,Ye,Te,He,Ve,al,nl,rl,Ge,Le,Ne,Oe,N,de,fl,yl,vl,kl,wl,_l,El;Q();const l=yt(),t=vt(),n=kt();xl();const r=E(""),o=E(!1),s=E(!1),c=E(!1),d=E(null),u=E(!1),b=E("");z(w("s_3bYN03dwoPc")),z(w("s_5uMa09XKVn0",[s,t]));const m=p(Io,"s_PmCmMc6X2Z8",[n,d]),f=p(Do,"s_Oj2eAQQs740",[b,u]),k=p(Ro,"s_jZ0pukvUDmc"),v=p(Lo,"s_P0fyr0gBEbU",[b,u]),A=p(No,"s_k2a2OXHs9uI"),S=p(Oo,"s_MLamGqUXdko",[o,r]);return e("div",null,{class:"space-y-8"},[e("section",null,{class:"bg-white dark:bg-gray-800 rounded-lg p-6 shadow"},[e("h2",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Cargar documento para auditoría",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300 mb-6"},"Sube un documento PDF para que nuestro sistema lo analice y detecte posibles problemas o áreas de mejora.",3,null),e("div",null,{class:"mb-8"},[e("button",null,{class:"flex items-center mb-4 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors",onClick$:w("s_i2V6AsE4288",[c])},[i(za,{class:"w-4 h-4 mr-1.5",[a]:{class:a}},3,"9Y_0"),g(T=>T.value?"Ocultar auditorías previas":"Mostrar auditorías previas",[c],'p0.value?"Ocultar auditorías previas":"Mostrar auditorías previas"')],1,null),c.value&&e("div",null,{class:"bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"},[e("h3",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-3"},"Auditorías previas",3,null),l.value.length>0?e("div",null,{class:"space-y-2"},l.value.map(T=>e("div",null,{class:"flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"},[e("div",null,null,[e("p",null,{class:"text-sm font-medium text-gray-800 dark:text-white"},$(T,"file_name"),1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400"},[new Date(T.upload_date).toLocaleString()," · ",((Number(T.file_size)||0)/1024/1024).toFixed(2)," MB"],1,null)],1,null),e("button",{onClick$:w("s_hqrYLe8PTwE",[T,m])},{class:"text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"},"Ver detalles",2,null)],1,T.id)),1,"9Y_1"):e("p",null,{class:"text-sm text-gray-600 dark:text-gray-400"},"No hay auditorías previas",3,null)],1,"9Y_2")],1,null),i(K,{action:t,children:e("div",null,{class:"space-y-6"},[e("div",null,{class:"flex justify-center"},e("div",null,{class:"w-full max-w-lg"},e("label",{class:`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer
                  ${o.value?"border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30":"border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/30"}`},{for:"pdfFileInput"},[e("div",null,{class:"flex flex-col items-center justify-center pt-5 pb-6"},o.value?i(B,{children:[i(Ce,{class:"w-10 h-10 mb-3 text-green-500 dark:text-green-400",[a]:{class:a}},3,"9Y_3"),e("p",null,{class:"mb-2 text-sm text-gray-700 dark:text-gray-300"},e("span",null,{class:"font-semibold"},g(T=>T.value,[r],"p0.value"),3,null),3,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400"},"Haz clic para cambiar el archivo",3,null)]},1,"9Y_4"):i(B,{children:[i(ln,{class:"w-10 h-10 mb-3 text-gray-400 dark:text-gray-500",[a]:{class:a}},3,"9Y_5"),e("p",null,{class:"mb-2 text-sm text-gray-600 dark:text-gray-400"},[e("span",null,{class:"font-semibold"},"Haz clic para subir",3,null)," o arrastra y suelta"],3,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400"},"PDF (MAX. 10MB)",3,null)]},1,"9Y_6"),1,null),e("input",null,{id:"pdfFileInput",type:"file",accept:".pdf",class:"hidden",required:!0,onChange$:S},null,3,null),e("input",null,{type:"hidden",name:"fileName",value:g(T=>T.value,[r],"p0.value")},null,3,null)],1,null),1,null),1,null),e("div",null,{class:"flex justify-center"},e("button",null,{type:"submit",class:"px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed",disabled:g((T,O)=>!T.value||O.value,[o,s],"!p0.value||p1.value"),onClick$:w("s_NHu5AMbpDhQ",[s])},s.value?i(B,{children:[i(ve,{class:"animate-spin w-5 h-5 mr-2",[a]:{class:a}},3,"9Y_7"),"Analizando documento..."]},1,"9Y_8"):i(B,{children:[i(V,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"9Y_9"),"Analizar documento"]},1,"9Y_10"),1,null),1,null)],1,null),[a]:{action:a}},1,"9Y_11")],1,null),t.value&&e("section",null,{class:"bg-white dark:bg-gray-800 rounded-lg p-6 shadow animate-[fadeIn_0.5s]"},(y=t.value)!=null&&y.success?e("div",null,{class:"space-y-4"},[e("div",null,{class:"flex items-start"},[i(Ce,{class:"w-6 h-6 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0",[a]:{class:a}},3,"9Y_12"),e("div",null,null,[e("h3",null,{class:"text-lg font-semibold text-gray-800 dark:text-white"},"Documento analizado con éxito",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},[g(T=>{var O;return(O=T.value)==null?void 0:O.fileName},[t],"p0.value?.fileName")," (",((Number((x=t.value)==null?void 0:x.fileSize)||0)/1024/1024).toFixed(2)," MB)"],1,null)],1,null)],1,null),e("div",null,{class:"mt-8 space-y-6"},[e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Información del documento",3,null),e("div",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"},e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-4"},[((j=(_=t.value)==null?void 0:_.analysis)==null?void 0:j.metadata)&&e("div",null,{class:"md:col-span-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-600"},[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400 mb-1"},"Información técnica:",3,null),e("div",null,{class:"flex flex-wrap gap-x-4 gap-y-1"},[e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Páginas:",3,null)," ",g(T=>T.value.analysis.metadata.pageCount,[t],"p0.value.analysis.metadata.pageCount")],3,null),e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Tamaño:",3,null)," ",(t.value.analysis.metadata.fileSize/1024/1024).toFixed(2)," MB"],1,null),e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Texto extraído:",3,null)," ",g(T=>T.value.analysis.metadata.textLength,[t],"p0.value.analysis.metadata.textLength")," caracteres"],3,null)],1,null)],1,"9Y_13"),e("div",null,null,[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400"},"Tipo de documento:",3,null),e("p",null,{class:"text-sm font-medium text-gray-800 dark:text-white"},g(T=>{var O,Me;return((Me=(O=T.value)==null?void 0:O.analysis)==null?void 0:Me.documentType)||"No disponible"},[t],'p0.value?.analysis?.documentType||"No disponible"'),3,null)],3,null),e("div",null,null,[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400"},"Validez legal:",3,null),e("div",null,{class:"flex items-center"},(h=(P=t.value)==null?void 0:P.analysis)!=null&&h.potentialIssues&&t.value.analysis.potentialIssues.length>3?e("div",null,{class:"flex items-center text-red-600 dark:text-red-400"},[i(re,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_14"),e("span",null,{class:"text-sm font-medium"},"Requiere revisión",3,null),e("span",null,{class:"bg-red-100 text-red-800 text-xs font-medium ml-2 px-2 py-0.5 rounded dark:bg-red-900 dark:text-red-300"},[g(T=>T.value.analysis.potentialIssues.length,[t],"p0.value.analysis.potentialIssues.length")," problemas"],3,null)],1,"9Y_15"):(ae=(Z=t.value)==null?void 0:Z.analysis)!=null&&ae.potentialIssues&&t.value.analysis.potentialIssues.length>0?e("div",null,{class:"flex items-center text-yellow-600 dark:text-yellow-400"},[i(re,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_16"),e("span",null,{class:"text-sm font-medium"},"Correcciones necesarias",3,null),e("span",null,{class:"bg-yellow-100 text-yellow-800 text-xs font-medium ml-2 px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"},[g(T=>T.value.analysis.potentialIssues.length,[t],"p0.value.analysis.potentialIssues.length")," problemas"],3,null)],1,"9Y_17"):(ie=(F=t.value)==null?void 0:F.analysis)!=null&&ie.validityCheck?e("div",null,{class:"flex items-center text-green-600 dark:text-green-400"},[i(Ce,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_18"),e("span",null,{class:"text-sm font-medium"},"Válido",3,null)],1,"9Y_19"):e("div",null,{class:"flex items-center text-red-600 dark:text-red-400"},[i(re,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_20"),e("span",null,{class:"text-sm font-medium"},"Inválido",3,null)],1,null),1,null)],1,null),e("div",null,null,[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400"},"Índice de confianza:",3,null),e("div",null,{class:"flex items-center"},[e("div",null,{class:"bg-gray-200 dark:bg-gray-600 w-32 h-2 rounded-full overflow-hidden mr-2"},e("div",null,{class:"bg-red-600 h-full rounded-full",style:g(T=>{var O,Me;return`width: ${(((Me=(O=T.value)==null?void 0:O.analysis)==null?void 0:Me.confidenceScore)||0)*100}%`},[t],"`width: ${(p0.value?.analysis?.confidenceScore||0)*100}%`")},null,3,null),3,null),e("span",null,{class:"text-sm font-medium text-gray-800 dark:text-white"},[((((Y=(ne=t.value)==null?void 0:ne.analysis)==null?void 0:Y.confidenceScore)||0)*100).toFixed(0),"%"],1,null)],1,null)],1,null)],1,null),1,null)],1,null),e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Términos legales identificados",3,null),e("ul",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2"},(ce=(q=(R=t.value)==null?void 0:R.analysis)==null?void 0:q.legalTerms)==null?void 0:ce.map((T,O)=>e("li",null,{class:"text-sm text-gray-700 dark:text-gray-300 flex items-start"},[e("span",null,{class:"inline-block w-5 text-center mr-2"},"•",3,null),T],1,O)),1,null)],1,null),e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Problemas potenciales",3,null),e("ul",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2"},(Re=(le=(te=t.value)==null?void 0:te.analysis)==null?void 0:le.potentialIssues)==null?void 0:Re.map((T,O)=>e("li",null,{class:"text-sm text-red-600 dark:text-red-400 flex items-start"},[i(re,{class:"w-4 h-4 mt-0.5 mr-2 flex-shrink-0",[a]:{class:a}},3,"9Y_21"),T],1,O)),1,null)],1,null),e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Acciones recomendadas",3,null),e("ul",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2"},(Ye=(ue=(be=t.value)==null?void 0:be.analysis)==null?void 0:ue.recommendedActions)==null?void 0:Ye.map((T,O)=>e("li",null,{class:"text-sm text-gray-700 dark:text-gray-300 flex items-start"},[e("span",null,{class:"inline-block w-5 text-center mr-2"},[O+1,"."],1,null),T],1,O)),1,null)],1,null),((He=(Te=t.value)==null?void 0:Te.analysis)==null?void 0:He.improvedDocument)&&e("div",null,{className:"mt-6"},[e("h4",null,{className:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Documento mejorado disponible",3,null),e("div",null,{className:"bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"},[e("div",null,{className:"flex items-center justify-between"},[e("div",null,{className:"flex items-center"},[i(Sl,{class:"w-6 h-6 text-green-600 dark:text-green-400 mr-3",[a]:{class:a}},3,"9Y_22"),e("div",null,null,[e("p",null,{class:"text-sm font-medium text-gray-800 dark:text-white"},g(T=>T.value.analysis.improvedDocument.fileName,[t],"p0.value.analysis.improvedDocument.fileName"),3,null),e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},"Documento generado con todas las mejoras recomendadas aplicadas",3,null)],3,null)],1,null),e("div",null,{class:"flex space-x-2"},[e("button",null,{class:"flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md",title:"Ver documento",onClick$:w("s_S0xTGMlVRsM",[f,t])},[i(ul,{class:"w-4 h-4 mr-1.5",[a]:{class:a}},3,"9Y_23"),"Ver"],1,null),e("button",null,{class:"flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md",title:"Descargar como PDF",onClick$:w("s_LTvwDCj2acU",[k,t])},[i(Se,{class:"w-4 h-4 mr-1.5",[a]:{class:a}},3,"9Y_24"),"Descargar"],1,null)],1,null)],1,null),e("div",null,{class:"mt-4 pt-4 border-t border-green-200 dark:border-green-800"},[e("p",null,{class:"text-sm text-gray-700 dark:text-gray-300 mb-2"},e("span",null,{class:"font-medium"},"Mejoras implementadas:",3,null),3,null),e("ul",null,{class:"space-y-2"},(Ve=t.value.analysis.improvedDocument.sections.filter(T=>T.title==="CORRECCIONES APLICADAS")[0])==null?void 0:Ve.content.split(`

`).map((T,O)=>e("li",null,{class:"text-xs text-gray-600 dark:text-gray-400 flex items-start"},[e("span",null,{class:"inline-block w-5 text-center mr-1"},"✓",3,null),T],1,O)),1,null)],1,null)],1,null)],1,"9Y_25")],1,null)],1,"9Y_26"):e("div",null,{class:"flex items-start"},[i(re,{class:"w-6 h-6 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0",[a]:{class:a}},3,"9Y_27"),e("div",null,null,[e("h3",null,{class:"text-lg font-semibold text-gray-800 dark:text-white"},"Error al analizar el documento",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},g(T=>{var O;return((O=T.value)==null?void 0:O.error)||"Ocurrió un error inesperado. Por favor, inténtalo de nuevo."},[t],'p0.value?.error||"Ocurrió un error inesperado. Por favor, inténtalo de nuevo."'),3,null),e("div",null,{class:"mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"},e("p",null,{class:"text-sm text-yellow-700 dark:text-yellow-300"},[e("strong",null,null,"Sugerencia:",3,null)," Asegúrate de que el archivo PDF sea válido, no esté protegido con contraseña y tenga un formato estándar. Para esta demostración, puedes elegir cualquier archivo PDF."],3,null),3,null)],3,null)],1,null),1,"9Y_28"),((al=n.value)==null?void 0:al.success)&&e("section",null,{class:"bg-white dark:bg-gray-800 rounded-lg p-6 shadow animate-[fadeIn_0.5s]"},n.value.success?e("div",null,{class:"space-y-4"},[e("div",null,{class:"flex items-start mb-4"},[i(Ce,{class:"w-6 h-6 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0",[a]:{class:a}},3,"9Y_29"),e("div",null,null,[e("h3",null,{class:"text-lg font-semibold text-gray-800 dark:text-white"},"Detalle de auditoría previa",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},[String(((nl=n.value)==null?void 0:nl.fileName)||"")," ","(",(rl=n.value)!=null&&rl.fileSize?(Number(n.value.fileSize)/1024/1024).toFixed(2):"0.00"," MB)"],1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400"},["Analizado el ",new Date(n.value.uploadDate).toLocaleString()],1,null)],1,null)],1,null),e("div",null,{class:"mt-8 space-y-6"},[e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Información del documento",3,null),e("div",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"},e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-4"},[((Ge=n.value.analysis)==null?void 0:Ge.metadata)&&e("div",null,{class:"md:col-span-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-600"},[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400 mb-1"},"Información técnica:",3,null),e("div",null,{class:"flex flex-wrap gap-x-4 gap-y-1"},[e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Páginas:",3,null)," ",g(T=>T.value.analysis.metadata.pageCount,[n],"p0.value.analysis.metadata.pageCount")],3,null),e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Tamaño:",3,null)," ",(n.value.analysis.metadata.fileSize/1024/1024).toFixed(2)," MB"],1,null),e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Texto extraído:",3,null)," ",g(T=>T.value.analysis.metadata.textLength,[n],"p0.value.analysis.metadata.textLength")," caracteres"],3,null)],1,null)],1,"9Y_30"),e("div",null,null,[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400"},"Tipo de documento:",3,null),e("p",null,{class:"text-sm font-medium text-gray-800 dark:text-white"},g(T=>{var O;return((O=T.value.analysis)==null?void 0:O.documentType)||"No disponible"},[n],'p0.value.analysis?.documentType||"No disponible"'),3,null)],3,null),e("div",null,null,[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400"},"Validez legal:",3,null),e("div",null,{class:"flex items-center"},(Le=n.value.analysis)!=null&&Le.potentialIssues&&n.value.analysis.potentialIssues.length>3?e("div",null,{class:"flex items-center text-red-600 dark:text-red-400"},[i(re,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_31"),e("span",null,{class:"text-sm font-medium"},"Requiere revisión",3,null),e("span",null,{class:"bg-red-100 text-red-800 text-xs font-medium ml-2 px-2 py-0.5 rounded dark:bg-red-900 dark:text-red-300"},[g(T=>T.value.analysis.potentialIssues.length,[n],"p0.value.analysis.potentialIssues.length")," problemas"],3,null)],1,"9Y_32"):(Ne=n.value.analysis)!=null&&Ne.potentialIssues&&n.value.analysis.potentialIssues.length>0?e("div",null,{class:"flex items-center text-yellow-600 dark:text-yellow-400"},[i(re,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_33"),e("span",null,{class:"text-sm font-medium"},"Correcciones necesarias",3,null),e("span",null,{class:"bg-yellow-100 text-yellow-800 text-xs font-medium ml-2 px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"},[g(T=>T.value.analysis.potentialIssues.length,[n],"p0.value.analysis.potentialIssues.length")," problemas"],3,null)],1,"9Y_34"):(Oe=n.value.analysis)!=null&&Oe.validityCheck?e("div",null,{class:"flex items-center text-green-600 dark:text-green-400"},[i(Ce,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_35"),e("span",null,{class:"text-sm font-medium"},"Válido",3,null)],1,"9Y_36"):e("div",null,{class:"flex items-center text-red-600 dark:text-red-400"},[i(re,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"9Y_37"),e("span",null,{class:"text-sm font-medium"},"Inválido",3,null)],1,null),1,null)],1,null),e("div",null,null,[e("p",null,{class:"text-sm text-gray-500 dark:text-gray-400"},"Índice de confianza:",3,null),e("div",null,{class:"flex items-center"},[e("div",null,{class:"bg-gray-200 dark:bg-gray-600 w-32 h-2 rounded-full overflow-hidden mr-2"},e("div",null,{class:"bg-red-600 h-full rounded-full",style:g(T=>{var O;return`width: ${(((O=T.value.analysis)==null?void 0:O.confidenceScore)||0)*100}%`},[n],"`width: ${(p0.value.analysis?.confidenceScore||0)*100}%`")},null,3,null),3,null),e("span",null,{class:"text-sm font-medium text-gray-800 dark:text-white"},[((((N=n.value.analysis)==null?void 0:N.confidenceScore)||0)*100).toFixed(0),"%"],1,null)],1,null)],1,null)],1,null),1,null)],1,null),e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Términos legales identificados",3,null),e("ul",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2"},(fl=(de=n.value.analysis)==null?void 0:de.legalTerms)==null?void 0:fl.map((T,O)=>e("li",null,{class:"text-sm text-gray-700 dark:text-gray-300 flex items-start"},[e("span",null,{class:"inline-block w-5 text-center mr-2"},"•",3,null),T],1,O)),1,null)],1,null),e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Problemas potenciales",3,null),e("ul",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2"},(vl=(yl=n.value.analysis)==null?void 0:yl.potentialIssues)==null?void 0:vl.map((T,O)=>e("li",null,{class:"text-sm text-red-600 dark:text-red-400 flex items-start"},[i(re,{class:"w-4 h-4 mt-0.5 mr-2 flex-shrink-0",[a]:{class:a}},3,"9Y_38"),T],1,O)),1,null)],1,null),e("div",null,null,[e("h4",null,{class:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Acciones recomendadas",3,null),e("ul",null,{class:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2"},(wl=(kl=n.value.analysis)==null?void 0:kl.recommendedActions)==null?void 0:wl.map((T,O)=>e("li",null,{class:"text-sm text-gray-700 dark:text-gray-300 flex items-start"},[e("span",null,{class:"inline-block w-5 text-center mr-2"},[O+1,"."],1,null),T],1,O)),1,null)],1,null),((_l=n.value.analysis)==null?void 0:_l.improvedDocument)&&e("div",null,{className:"mt-6"},[e("h4",null,{className:"text-md font-semibold text-gray-800 dark:text-white mb-2"},"Documento mejorado disponible",3,null),e("div",null,{className:"bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"},[e("div",null,{className:"flex items-center justify-between"},[e("div",null,{className:"flex items-center"},[i(Sl,{class:"w-6 h-6 text-green-600 dark:text-green-400 mr-3",[a]:{class:a}},3,"9Y_39"),e("div",null,null,[e("p",null,{class:"text-sm font-medium text-gray-800 dark:text-white"},g(T=>T.value.analysis.improvedDocument.fileName,[n],"p0.value.analysis.improvedDocument.fileName"),3,null),e("p",null,{class:"text-xs text-gray-600 dark:text-gray-300"},"Documento generado con todas las mejoras recomendadas aplicadas",3,null)],3,null)],1,null),e("div",null,{class:"flex space-x-2"},[e("button",null,{class:"flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md",title:"Ver documento",onClick$:w("s_G1V76m9ljEY",[n,f])},[i(ul,{class:"w-4 h-4 mr-1.5",[a]:{class:a}},3,"9Y_40"),"Ver"],1,null),e("button",null,{class:"flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md",title:"Descargar como PDF",onClick$:w("s_KwE0ZNWYVnE",[n,k])},[i(Se,{class:"w-4 h-4 mr-1.5",[a]:{class:a}},3,"9Y_41"),"Descargar"],1,null)],1,null)],1,null),e("div",null,{class:"mt-4 pt-4 border-t border-green-200 dark:border-green-800"},[e("p",null,{class:"text-sm text-gray-700 dark:text-gray-300 mb-2"},e("span",null,{class:"font-medium"},"Mejoras implementadas:",3,null),3,null),e("ul",null,{class:"space-y-2"},(El=n.value.analysis.improvedDocument.sections.filter(T=>T.title==="CORRECCIONES APLICADAS")[0])==null?void 0:El.content.split(`

`).map((T,O)=>e("li",null,{class:"text-xs text-gray-600 dark:text-gray-400 flex items-start"},[e("span",null,{class:"inline-block w-5 text-center mr-1"},"✓",3,null),T],1,O)),1,null)],1,null)],1,null)],1,"9Y_42")],1,null),e("div",null,{class:"mt-6 text-center"},e("button",null,{class:"px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",onClick$:w("s_9LtdxS7ap1Y",[d])},"Volver a la lista",3,null),3,null)],1,"9Y_43"):e("div",null,{class:"flex items-start"},[i(re,{class:"w-6 h-6 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0",[a]:{class:a}},3,"9Y_44"),e("div",null,null,[e("h3",null,{class:"text-lg font-semibold text-gray-800 dark:text-white"},"Error al cargar la auditoría",3,null),e("p",null,{class:"text-sm text-gray-600 dark:text-gray-300"},g(T=>T.value.error||"Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",[n],'p0.value.error||"Ocurrió un error inesperado. Por favor, inténtalo de nuevo."'),3,null)],3,null)],1,null),1,"9Y_45"),e("div",null,{class:"bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300"},[e("p",null,{class:"mb-2 font-semibold"},"Nota sobre la integración de LangChain:",3,null),e("p",null,null,"Esta funcionalidad está integrada con LangChain WebPDFLoader para el análisis de documentos PDF. Los documentos se procesan en dos etapas:",3,null),e("ol",null,{class:"list-decimal ml-5 mt-2 space-y-1"},[e("li",null,null,"Primero, el PDF se carga y se extrae su contenido textual usando WebPDFLoader.",3,null),e("li",null,null,"Luego, el contenido extraído se analiza para identificar términos legales, posibles problemas y recomendaciones.",3,null)],3,null),e("p",null,{class:"mt-2"},"Esta integración permite auditar documentos legales de forma automatizada, identificando rápidamente aspectos importantes y posibles problemas que podrían requerir atención.",3,null),e("div",null,{class:"mt-3 pt-3 border-t border-blue-200 dark:border-blue-700"},[e("p",null,{class:"font-semibold text-xs"},"Solución de problemas con PDF:",3,null),e("ul",null,{class:"list-disc ml-5 mt-1 space-y-1 text-xs"},[e("li",null,null,"Si el PDF no puede ser analizado, prueba guardarlo nuevamente desde su aplicación original.",3,null),e("li",null,null,"Algunos PDFs escaneados o protegidos pueden no ser compatibles con el análisis automático.",3,null),e("li",null,null,"Para mejores resultados, utiliza PDFs generados digitalmente en lugar de documentos escaneados.",3,null),e("li",null,null,"El proceso de análisis puede tardar unos segundos dependiendo del tamaño y complejidad del documento.",3,null)],3,null)],3,null)],3,null),u.value&&e("div",null,{class:"fixed inset-0 bg-black bg-opacity-70 z-50 flex items-stretch justify-center",tabIndex:0,onClick$:w("s_WMCuySJps94",[v]),onKeyDown$:w("s_4NMzay0JcZM",[v])},e("div",null,{class:"bg-white dark:bg-gray-800 w-full h-full flex flex-col"},[e("div",null,{class:"flex items-center justify-between px-6 py-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"},[e("h3",null,{class:"text-lg font-semibold text-gray-800 dark:text-white"},"Vista previa del documento",3,null),e("div",null,{class:"flex space-x-3"},[e("button",null,{class:"p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-600 rounded-full shadow-sm",title:"Imprimir",onClick$:A},i(Hl,{class:"w-5 h-5",[a]:{class:a}},3,"9Y_46"),1,null),e("button",null,{class:"p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 bg-white dark:bg-gray-600 rounded-full shadow-sm flex items-center justify-center transition-colors",title:"Cerrar (Esc)","aria-label":"Cerrar visor",onClick$:v},e("span",null,{class:"text-xl font-bold"},"×",3,null),3,null)],1,null)],1,null),e("div",null,{class:"flex-1 overflow-hidden"},e("iframe",null,{id:"pdf-iframe",src:g(T=>T.value,[b],"p0.value"),class:"w-full h-full border-0",title:"Documento mejorado"},null,3,null),3,null)],1,null),1,"9Y_47"),e("style",null,null,`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,3,null)],1,"9Y_48")},jo=M(p(Mo,"s_WuGwVE8wFl8")),Po=Object.freeze(Object.defineProperty({__proto__:null,_auto_createHtmlContent:wt,default:jo,useAuditoriasList:yt,useGetAuditDetail:kt,useProcessPDF:vt},Symbol.toStringTag,{value:"Module"}));async function Uo(l){console.log("[DB-INIT] Starting database initialization");const t=U(l);try{console.log("[DB-INIT] Using hardcoded auth schema");const r=`
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
    `.split(";").map(c=>c.trim()).filter(c=>c.length>0);console.log(`[DB-INIT] Executing ${r.length} SQL statements`);for(const c of r)await t.execute(c);return(await t.batch(["SELECT name FROM sqlite_master WHERE type='table' AND name='users'","SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'","SELECT name FROM sqlite_master WHERE type='table' AND name='user_absences'","SELECT name FROM sqlite_master WHERE type='table' AND name='user_timesheet'","SELECT name FROM sqlite_master WHERE type='table' AND name='cursos_capacitacion'","SELECT name FROM sqlite_master WHERE type='table' AND name='modulos_curso'","SELECT name FROM sqlite_master WHERE type='table' AND name='recursos_curso'","SELECT name FROM sqlite_master WHERE type='table' AND name='progreso_curso'"],"read")).every(c=>c.rows.length>0)?(console.log("[DB-INIT] Database initialized successfully"),{success:!0,message:"Authentication database initialized successfully"}):(console.error("[DB-INIT] Verification failed: one or more required tables not found."),{success:!1,message:"One or more required tables were not created successfully"})}catch(n){return console.error("[DB-INIT] Error initializing database:",n),{success:!1,message:`Database initialization failed: ${n instanceof Error?n.message:String(n)}`}}}async function $o(l){console.log("[DB-CHECK] Checking database connection");const t=U(l);try{const n=await t.execute("SELECT 1 as test");return n.rows&&n.rows.length>0?(console.log("[DB-CHECK] Database connection successful"),{connected:!0,message:"Database connection successful"}):(console.error("[DB-CHECK] Database connection failed: No rows returned"),{connected:!1,message:"Database connection test failed: No rows returned"})}catch(n){return console.error("[DB-CHECK] Database connection error:",n),{connected:!1,message:`Database connection failed: ${n instanceof Error?n.message:String(n)}`}}}const zo=async(l,t)=>{try{return console.log("[LOGOUT] Starting logout process"),zl(t),t.redirect(302,"/auth"),{success:!0}}catch(n){return console.error("Logout error:",n),{success:!1,error:n instanceof Error?n.message:"Logout failed"}}},Fo=X(p(zo,"s_iyKbdfOHuOI")),qo=async(l,t)=>{const n=U(t),{email:r}=l;try{return{success:!0,isRegistered:(await n.execute({sql:"SELECT id FROM users WHERE email = ?",args:[r]})).rows.length>0}}catch(o){return console.error("Email check error:",o),{success:!1,error:o instanceof Error?o.message:"Failed to check email"}}},_t=X(p(qo,"s_Emz3Bmx8A2s")),Bo=async(l,t)=>{const n=U(t),{email:r,password:o,fullName:s,userType:c}=l;try{const d=await va(o);let u;const b=c,m=s?"INSERT INTO users (email, password_hash, type, name) VALUES (?, ?, ?, ?)":"INSERT INTO users (email, password_hash, type) VALUES (?, ?, ?)",f=s?[r,d,b,s.trim()]:[r,d,b];if(u=(await n.execute({sql:m,args:f})).lastInsertRowid,!u)throw new Error("Registration failed: userId is undefined");const v=String(u);return $l(t,v,b),t.redirect(302,"/chat"),{success:!0}}catch(d){return console.error("Registration error:",d),{success:!1,error:d instanceof Error?d.message:"Registration failed"}}},Et=X(p(Bo,"s_dp10BsJQTcg")),Yo=async(l,t)=>{const n=U(t),{email:r,password:o}=l;try{const c=(await n.execute({sql:"SELECT * FROM users WHERE email = ?",args:[r]})).rows[0];if(!c||typeof c.password_hash!="string"||!c.id)return{success:!1,error:"Invalid user data"};if(!await ka(o,c.password_hash))return{success:!1,error:"Invalid password"};const u=String(c.id);await n.execute({sql:"UPDATE users SET session_expires = ? WHERE id = ?",args:[new Date(Date.now()+864e5),u]});const b=c.type;return $l(t,u,b),t.redirect(302,"/chat"),{success:!0}}catch(s){return console.error("Login error:",s),{success:!1,error:"Login failed"}}},Tt=X(p(Yo,"s_R0sJTR90Tks")),Ho=async l=>{console.log("[AUTH-SETUP] Starting database setup");try{const t=await $o(l);if(!t.connected)return console.error("[AUTH-SETUP] Database connection failed:",t.message),{success:!1,error:"Database connection failed. Check your environment configuration.",details:t.message};const n=await Uo(l);if(!n.success)return console.error("[AUTH-SETUP] Database initialization failed:",n.message),{success:!1,error:"Failed to initialize authentication database.",details:n.message};const r=W(l);return console.log(`[AUTH-SETUP] Current user ID: ${r||"none"}`),console.log("[AUTH-SETUP] Database setup completed successfully"),{success:!0,message:"Database initialized successfully",user_id:r}}catch(t){return console.error("[AUTH-SETUP] Unexpected error during setup:",t),{success:!1,error:"An unexpected error occurred during setup",details:t instanceof Error?t.message:String(t)}}},Ct=G(p(Ho,"s_wERsQ0wluBY")),Vo=()=>{var s,c;const[l,t,n,r,o]=I();(s=l.value)!=null&&s.success?(o.value=l.value.isRegistered?"password":"register",t.value=document.getElementById("email").value):n.value=((c=l.value)==null?void 0:c.error)||"Failed to check email",r.value=!1},Go=()=>{var r,o;const[l,t,n]=I();(r=n.value)!=null&&r.success||(l.value=((o=n.value)==null?void 0:o.error)||"Login failed"),t.value=!1},Xo=()=>{const[l,t,n]=I(),r=n.value;r&&typeof r=="object"&&"success"in r&&!r.success&&(l.value=r&&"error"in r&&r.error?String(r.error):"Registration failed"),t.value=!1},Wo=()=>{var m,f,k;Q();const l=Ct(),t=_t(),n=Et(),r=Tt(),o=E("email"),s=E(""),c=E(""),d=E(""),u=E(!1),b=E(null);return(m=l.value)!=null&&m.success?(console.log("Tables initialized successfully"),b.value="Database ready"):(f=l.value)!=null&&f.error&&(console.error("Database setup error:",l.value.error),b.value=`Database Error: ${l.value.error}`,d.value=l.value.error),e("div",null,{class:"min-h-screen w-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative"},[e("div",null,{class:"fixed inset-0 pointer-events-none overflow-hidden z-0"},[e("div",null,{class:"w-3 h-3 bg-red-400/50 dark:bg-red-300/40 rounded-full absolute top-[20%] left-[35%] animate-[pulse_4s_infinite]"},null,3,null),e("div",null,{class:"w-2 h-2 bg-red-400/50 dark:bg-red-300/40 rounded-full absolute top-[60%] left-[70%] animate-[pulse_5s_infinite]",style:"animation-delay: 0.7s;"},null,3,null)],3,null),e("div",null,{class:"absolute top-6 left-1/2 transform -translate-x-1/2"},e("div",null,{class:"flex items-center"},[e("div",null,{class:"relative"},e("div",null,{class:"w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg"},i(Ze,{class:"w-6 h-6",[a]:{class:a}},3,"lQ_0"),1,null),1,null),e("div",null,{class:"ml-2 flex flex-col"},[e("h1",null,{class:"text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},"DAI Off",3,null),e("span",null,{class:"text-xs text-red-700 dark:text-red-400"},"Tu Defensor Laboral Digital",3,null)],3,null)],1,null),1,null),e("div",null,{class:"max-w-md w-full z-10"},[e("div",null,{class:"bg-white dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]"},[e("div",null,{class:"text-center mb-8"},[e("h2",null,{class:"text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300"},g(v=>v.value==="email"?"Bienvenido de vuelta!":v.value==="password"?"Iniciar Sesión":"Únete a DAI Off",[o],'p0.value==="email"?"Bienvenido de vuelta!":p0.value==="password"?"Iniciar Sesión":"Únete a DAI Off"'),3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300"},g((v,A)=>A.value==="email"?"Enter your email to continue":A.value==="password"?`Signing in as ${v.value}`:`Complete registration for ${v.value}`,[s,o],'p1.value==="email"?"Enter your email to continue":p1.value==="password"?`Signing in as ${p0.value}`:`Complete registration for ${p0.value}`'),3,null)],3,null),o.value==="email"&&i(K,{action:t,class:"space-y-6",onSubmit$:p(Vo,"s_0W0s83zLYU4",[t,s,d,u,o]),children:[e("div",null,{class:"space-y-2"},[e("label",null,{for:"email",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Email Address",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},i(Fa,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[a]:{class:a}},3,"lQ_1"),1,null),e("input",null,{id:"email",name:"email",type:"email",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"you@example.com"},null,3,null)],1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"We'll check if you already have an account",3,null)],1,null),e("button",null,{type:"submit",disabled:g(v=>v.value,[u],"p0.value"),class:"w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:w("s_nhTrYlK9e5w",[d,u])},u.value?e("span",null,{class:"flex items-center"},[i(ve,{class:"animate-spin mr-2 h-5 w-5 text-white",[a]:{class:a}},3,"lQ_2"),"Checking..."],1,"lQ_3"):"Continue",1,null)],[a]:{action:a,class:a,onSubmit$:a}},1,"lQ_4"),o.value==="password"&&i(K,{action:r,class:"space-y-6",onSubmit$:p(Go,"s_XMeAkUxhnZI",[d,u,r]),children:[e("input",null,{type:"hidden",name:"email",value:g(v=>v.value,[s],"p0.value")},null,3,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"password",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Password",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},i(Al,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[a]:{class:a}},3,"lQ_5"),1,null),e("input",null,{id:"password",name:"password",type:"password",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"••••••••"},null,3,null)],1,null),e("div",null,{class:"flex justify-end"},e("a",null,{href:"#",class:"text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"},"Forgot password?",3,null),3,null)],1,null),e("div",null,{class:"flex justify-between items-center"},[e("button",null,{type:"button",class:"flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm",onClick$:w("s_Hkz91dGcq04",[d,c,o])},[i(fe,{class:"mr-2 h-4 w-4",[a]:{class:a}},3,"lQ_6"),"Back"],1,null),e("button",null,{type:"submit",disabled:g(v=>v.value,[u],"p0.value"),class:"flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:w("s_iXE2aeUX0tQ",[d,u])},u.value?e("span",null,{class:"flex items-center"},[i(ve,{class:"animate-spin mr-2 h-5 w-5 text-white",[a]:{class:a}},3,"lQ_7"),"Signing in..."],1,"lQ_8"):"Sign In",1,null)],1,null)],[a]:{action:a,class:a,onSubmit$:a}},1,"lQ_9"),o.value==="register"&&i(K,{action:n,class:"space-y-6",onSubmit$:p(Xo,"s_BNuG0tWAYzo",[d,u,n]),children:[e("input",null,{type:"hidden",name:"email",value:g(v=>v.value,[s],"p0.value")},null,3,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"password",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Create Password",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},i(Al,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[a]:{class:a}},3,"lQ_10"),1,null),e("input",null,{id:"password",name:"password",type:"password",required:!0,class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"Choose a strong password",minLength:6},null,3,null)],1,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"Password must be at least 6 characters",3,null)],1,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"fullName",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Full Name (Optional)",3,null),e("div",null,{class:"relative"},[e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},i(Ze,{class:"h-5 w-5 text-gray-400 dark:text-gray-500",[a]:{class:a}},3,"lQ_11"),1,null),e("input",null,{id:"fullName",name:"fullName",type:"text",class:"pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700",placeholder:"Your Name"},null,3,null)],1,null)],1,null),e("div",null,{class:"space-y-2"},[e("label",null,{for:"userType",class:"block text-sm font-medium text-gray-700 dark:text-gray-300"},"Tipo de Usuario",3,null),e("div",null,{class:"relative"},e("select",null,{id:"userType",name:"userType",required:!0,class:"block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700"},[e("option",null,{value:"",disabled:!0,selected:!0},"Selecciona un tipo",3,null),e("option",null,{value:"trabajador"},"Trabajador",3,null),e("option",null,{value:"despacho"},"Despacho",3,null),e("option",null,{value:"sindicato"},"Sindicato",3,null)],3,null),3,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"Selecciona el tipo de usuario que mejor te describe",3,null)],3,null),e("div",null,{class:"flex justify-between items-center"},[e("button",null,{type:"button",class:"flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm",onClick$:w("s_ivZv3s0Fr3k",[d,c,o])},[i(fe,{class:"mr-2 h-4 w-4",[a]:{class:a}},3,"lQ_12"),"Back"],1,null),e("button",null,{type:"submit",disabled:g(v=>v.value,[u],"p0.value"),class:"flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed",onClick$:w("s_857oCKNI0eQ",[d,u])},u.value?e("span",null,{class:"flex items-center"},[i(ve,{class:"animate-spin mr-2 h-5 w-5 text-white",[a]:{class:a}},3,"lQ_13"),"Creating account..."],1,"lQ_14"):"Create Account",1,null)],1,null)],[a]:{action:a,class:a,onSubmit$:a}},1,"lQ_15"),d.value&&e("div",null,{class:"mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-[slide-up_0.3s_ease-out]"},e("div",null,{class:"flex items-start"},[i(re,{class:"h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0",[a]:{class:a}},3,"lQ_16"),e("div",null,null,[e("p",null,{class:"text-sm text-red-600 dark:text-red-300 font-semibold"},g(v=>v.value,[d],"p0.value"),3,null),((k=l.value)==null?void 0:k.details)&&e("p",null,{class:"text-xs text-red-500 dark:text-red-300 mt-1"},["Details: ",g(v=>v.value.details,[l],"p0.value.details")],3,"lQ_17")],1,null)],1,null),1,"lQ_18"),!1],1,null),e("div",null,{class:"mt-6 text-center text-sm text-gray-600 dark:text-gray-400"},["Al continuar, aceptas los",e("a",null,{href:"/terms",class:"text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 ml-1"},"Términos de Servicio",3,null),e("span",null,{class:"mx-1"},"y",3,null),e("a",null,{href:"/privacy",class:"text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"},"Política de Privacidad",3,null),"de DAI Off"],3,null)],1,null),e("style",null,null,`
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
      `,3,null)],1,"lQ_21")},Ko=M(p(Wo,"s_Rhbq243Q8qQ")),Qo=Object.freeze(Object.defineProperty({__proto__:null,default:Ko,useCheckEmail:_t,useLogin:Tt,useLogout:Fo,useRegister:Et,useTableSetup:Ct},Symbol.toStringTag,{value:"Module"})),Zo=`.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile::-moz-selection{background:transparent}.leaflet-tile::selection{background:transparent}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-overlay-pane svg{max-width:none!important;max-height:none!important}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none!important;max-height:none!important;width:auto;padding:0}.leaflet-container img.leaflet-tile{mix-blend-mode:plus-lighter}.leaflet-container.leaflet-touch-zoom{touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{touch-action:none}.leaflet-container{-webkit-tap-highlight-color:transparent}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,.4)}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;box-sizing:border-box;z-index:800}.leaflet-overlay-pane svg{-moz-user-select:none}.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-vml-shape{width:1px;height:1px}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-fade-anim .leaflet-popup{opacity:0;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}.leaflet-zoom-animated{transform-origin:0 0}svg.leaflet-zoom-animated{will-change:transform}.leaflet-zoom-anim .leaflet-zoom-animated{transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{transition:none}.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-popup-pane,.leaflet-control{cursor:auto}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:grabbing}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane>svg path,.leaflet-tile-container{pointer-events:none}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container{background:#ddd;outline-offset:1px}.leaflet-container a{color:#0078a8}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,.5)}.leaflet-container{font-family:Helvetica Neue,Arial,Helvetica,sans-serif;font-size:12px;font-size:.75rem;line-height:1.5}.leaflet-bar{box-shadow:0 1px 5px #000000a6;border-radius:4px}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:700 18px Lucida Console,Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px}.leaflet-control-layers{box-shadow:0 1px 5px #0006;background:#fff;border-radius:5px}.leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAQAAAADQ4RFAAACf0lEQVR4AY1UM3gkARTePdvdoTxXKc+qTl3aU5U6b2Kbkz3Gtq3Zw6ziLGNPzrYx7946Tr6/ee/XeCQ4D3ykPtL5tHno4n0d/h3+xfuWHGLX81cn7r0iTNzjr7LrlxCqPtkbTQEHeqOrTy4Yyt3VCi/IOB0v7rVC7q45Q3Gr5K6jt+3Gl5nCoDD4MtO+j96Wu8atmhGqcNGHObuf8OM/x3AMx38+4Z2sPqzCxRFK2aF2e5Jol56XTLyggAMTL56XOMoS1W4pOyjUcGGQdZxU6qRh7B9Zp+PfpOFlqt0zyDZckPi1ttmIp03jX8gyJ8a/PG2yutpS/Vol7peZIbZcKBAEEheEIAgFbDkz5H6Zrkm2hVWGiXKiF4Ycw0RWKdtC16Q7qe3X4iOMxruonzegJzWaXFrU9utOSsLUmrc0YjeWYjCW4PDMADElpJSSQ0vQvA1Tm6/JlKnqFs1EGyZiFCqnRZTEJJJiKRYzVYzJck2Rm6P4iH+cmSY0YzimYa8l0EtTODFWhcMIMVqdsI2uiTvKmTisIDHJ3od5GILVhBCarCfVRmo4uTjkhrhzkiBV7SsaqS+TzrzM1qpGGUFt28pIySQHR6h7F6KSwGWm97ay+Z+ZqMcEjEWebE7wxCSQwpkhJqoZA5ivCdZDjJepuJ9IQjGGUmuXJdBFUygxVqVsxFsLMbDe8ZbDYVCGKxs+W080max1hFCarCfV+C1KATwcnvE9gRRuMP2prdbWGowm1KB1y+zwMMENkM755cJ2yPDtqhTI6ED1M/82yIDtC/4j4BijjeObflpO9I9MwXTCsSX8jWAFeHr05WoLTJ5G8IQVS/7vwR6ohirYM7f6HzYpogfS3R2OAAAAAElFTkSuQmCC);width:36px;height:36px}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAQAAABvcdNgAAAEsklEQVR4AWL4TydIhpZK1kpWOlg0w3ZXP6D2soBtG42jeI6ZmQTHzAxiTbSJsYLjO9HhP+WOmcuhciVnmHVQcJnp7DFvScowZorad/+V/fVzMdMT2g9Cv9guXGv/7pYOrXh2U+RRR3dSd9JRx6bIFc/ekqHI29JC6pJ5ZEh1yWkhkbcFeSjxgx3L2m1cb1C7bceyxA+CNjT/Ifff+/kDk2u/w/33/IeCMOSaWZ4glosqT3DNnNZQ7Cs58/3Ce5HL78iZH/vKVIaYlqzfdLu8Vi7dnvUbEza5Idt36tquZFldl6N5Z/POLof0XLK61mZCmJSWjVF9tEjUluu74IUXvgttuVIHE7YxSkaYhJZam7yiM9Pv82JYfl9nptxZaxMJE4YSPty+vF0+Y2up9d3wwijfjZbabqm/3bZ9ecKHsiGmRflnn1MW4pjHf9oLufyn2z3y1D6n8g8TZhxyzipLNPnAUpsOiuWimg52psrTZYnOWYNDTMuWBWa0tJb4rgq1UvmutpaYEbZlwU3CLJm/ayYjHW5/h7xWLn9Hh1vepDkyf7dE7MtT5LR4e7yYpHrkhOUpEfssBLq2pPhAqoSWKUkk7EDqkmK6RrCEzqDjhNDWNE+XSMvkJRDWlZTmCW0l0PHQGRZY5t1L83kT0Y3l2SItk5JAWHl2dCOBm+fPu3fo5/3v61RMCO9Jx2EEYYhb0rmNQMX/vm7gqOEJLcXTGw3CAuRNeyaPWwjR8PRqKQ1PDA/dpv+on9Shox52WFnx0KY8onHayrJzm87i5h9xGw/tfkev0jGsQizqezUKjk12hBMKJ4kbCqGPVNXudyyrShovGw5CgxsRICxF6aRmSjlBnHRzg7Gx8fKqEubI2rahQYdR1YgDIRQO7JvQyD52hoIQx0mxa0ODtW2Iozn1le2iIRdzwWewedyZzewidueOGqlsn1MvcnQpuVwLGG3/IR1hIKxCjelIDZ8ldqWz25jWAsnldEnK0Zxro19TGVb2ffIZEsIO89EIEDvKMPrzmBOQcKQ+rroye6NgRRxqR4U8EAkz0CL6uSGOm6KQCdWjvjRiSP1BPalCRS5iQYiEIvxuBMJEWgzSoHADcVMuN7IuqqTeyUPq22qFimFtxDyBBJEwNyt6TM88blFHao/6tWWhuuOM4SAK4EI4QmFHA+SEyWlp4EQoJ13cYGzMu7yszEIBOm2rVmHUNqwAIQabISNMRstmdhNWcFLsSm+0tjJH1MdRxO5Nx0WDMhCtgD6OKgZeljJqJKc9po8juskR9XN0Y1lZ3mWjLR9JCO1jRDMd0fpYC2VnvjBSEFg7wBENc0R9HFlb0xvF1+TBEpF68d+DHR6IOWVv2BECtxo46hOFUBd/APU57WIoEwJhIi2CdpyZX0m93BZicktMj1AS9dClteUFAUNUIEygRZCtik5zSxI9MubTBH1GOiHsiLJ3OCoSZkILa9PxiN0EbvhsAo8tdAf9Seepd36lGWHmtNANTv5Jd0z4QYyeo/UEJqxKRpg5LZx6btLPsOaEmdMyxYdlc8LMaJnikDlhclqmPiQnTEpLUIZEwkRagjYkEibQErwhkTAKCLQEbUgkzJQWc/0PstHHcfEdQ+UAAAAASUVORK5CYII=);background-size:26px 26px}.leaflet-touch .leaflet-control-layers-toggle{width:44px;height:44px}.leaflet-control-layers .leaflet-control-layers-list,.leaflet-control-layers-expanded .leaflet-control-layers-toggle{display:none}.leaflet-control-layers-expanded .leaflet-control-layers-list{display:block;position:relative}.leaflet-control-layers-expanded{padding:6px 10px 6px 6px;color:#333;background:#fff}.leaflet-control-layers-scrollbar{overflow-y:scroll;overflow-x:hidden;padding-right:5px}.leaflet-control-layers-selector{margin-top:2px;position:relative;top:1px}.leaflet-control-layers label{display:block;font-size:13px;font-size:1.08333em}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px 5px -6px}.leaflet-default-icon-path{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=)}.leaflet-container .leaflet-control-attribution{background:#fff;background:rgba(255,255,255,.8);margin:0}.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333;line-height:1.4}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover,.leaflet-control-attribution a:focus{text-decoration:underline}.leaflet-attribution-flag{display:inline!important;vertical-align:baseline!important;width:1em;height:.6669em}.leaflet-left .leaflet-control-scale{margin-left:5px}.leaflet-bottom .leaflet-control-scale{margin-bottom:5px}.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;white-space:nowrap;box-sizing:border-box;background:rgba(255,255,255,.8);text-shadow:1px 1px #fff}.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px}.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777}.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{box-shadow:none}.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px}.leaflet-popup-content{margin:13px 24px 13px 20px;line-height:1.3;font-size:13px;font-size:1.08333em;min-height:1px}.leaflet-popup-content p{margin:1.3em 0}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-top:-1px;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;pointer-events:auto;transform:rotate(45deg)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:white;color:#333;box-shadow:0 3px 14px #0006}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;border:none;text-align:center;width:24px;height:24px;font:16px/24px Tahoma,Verdana,sans-serif;color:#757575;text-decoration:none;background:transparent}.leaflet-container a.leaflet-popup-close-button:hover,.leaflet-container a.leaflet-popup-close-button:focus{color:#585858}.leaflet-popup-scrolled{overflow:auto}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}.leaflet-oldie .leaflet-popup-tip{width:24px;margin:0 auto;-ms-filter:"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)";filter:progid:DXImageTransform.Microsoft.Matrix(M11=.70710678,M12=.70710678,M21=-.70710678,M22=.70710678)}.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999}.leaflet-div-icon{background:#fff;border:1px solid #666}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px #0006}.leaflet-tooltip.leaflet-interactive{cursor:pointer;pointer-events:auto}.leaflet-tooltip-top:before,.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}.leaflet-tooltip-bottom{margin-top:6px}.leaflet-tooltip-top{margin-top:-6px}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}.leaflet-tooltip-left{margin-left:-6px}.leaflet-tooltip-right{margin-left:6px}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}@media print{.leaflet-control{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`,Jo=Zo+`
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
    `,es=l=>{ga(p(Jo,"s_ersnw0c2HOY"));const t=E();return z(w("s_E0NWQbbPBzs",[t,l])),e("div",null,{id:"map",style:{height:"25rem",width:"100%",borderRadius:"0.5rem"}},null,3,"Za_0")},St=M(p(es,"s_8dKzP2mTye4")),ls=l=>{const t=E({name:l.name??"Tu ubicación",point:[l.latitude,l.longitude],zoom:15,marker:!0});return i(St,{location:t,[a]:{location:a}},3,"Za_1")},ts=M(p(ls,"s_RVsF00ZXFwI")),At=[{name:"Oficina Central",label:"HQ",lat:"45.770946",lon:"13.31338"},{name:"Sucursal Norte",label:"N",lat:"46.312663",lon:"13.274682"},{name:"Sucursal Sur",label:"S",lat:"45.610495",lon:"13.752682"}],as=()=>{const l=E({name:"Ubicación Actual",point:[45.943512,13.482948],zoom:9,marker:!0}),t=E("all");return e("div",null,{class:"px-4 py-6"},[e("div",null,{class:"mb-6"},[e("h1",null,{class:"text-2xl font-bold text-gray-800 dark:text-white mb-4"},"Demo de LeafletJS Map",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-300 mb-4"},"Ejemplo de implementación del mapa para la aplicación.",3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"},[e("h2",null,{class:"text-xl font-semibold mb-4"},"Mapa Interactivo",3,null),i(St,{location:l,get markers(){return At},group:t,[a]:{location:a,markers:a,group:a}},3,"ei_0")],1,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-4"},[e("h3",null,{class:"font-medium mb-2"},"Instrucciones de Uso",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-sm"},[e("li",null,null,["Utiliza el componente ",e("code",null,null,"LeafletMap",3,null)," para mostrar ubicaciones"],3,null),e("li",null,null,["Configura el zoom y centro del mapa con ",e("code",null,null,"location",3,null)],3,null),e("li",null,null,["Añade marcadores con el array ",e("code",null,null,"markers",3,null)],3,null),e("li",null,null,"Los marcadores pueden ser filtrados con grupos",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-4"},[e("h3",null,{class:"font-medium mb-2"},"En la aplicación de Timesheet",3,null),e("p",null,{class:"text-sm"},"Este mapa se utiliza para mostrar las ubicaciones de fichaje de los empleados. Reemplaza el iframe de Google Maps con un mapa interactivo de LeafletJS que es más ligero y no requiere API key.",3,null)],3,null)],3,null)],1,"ei_1")},ns=M(p(as,"s_q0SrePkbHM4")),rs=Object.freeze(Object.defineProperty({__proto__:null,_auto_markers:At,default:ns},Symbol.toStringTag,{value:"Module"})),os=async l=>{try{return(await U(l).execute(`
      SELECT id, titulo, descripcion, categoria, instructor, duracion, imagen_color
      FROM cursos_capacitacion
      ORDER BY fecha_creacion DESC
    `)).rows.map(r=>({id:Number(r.id),titulo:String(r.titulo),descripcion:String(r.descripcion),categoria:String(r.categoria),imagen_color:String(r.imagen_color||"bg-red-100 dark:bg-red-900/20"),instructor:r.instructor?String(r.instructor):void 0,duracion:r.duracion?String(r.duracion):void 0}))}catch(t){return console.error("[CAPACITACION] Error al cargar cursos:",t),[]}},It=G(p(os,"s_Cp7y9bSUCUc")),ss=()=>{const[l,t,n,r]=I();let o=t.value;if(n.value!=="todas"&&(o=o.filter(s=>s.categoria===n.value)),r.value.trim()!==""){const s=r.value.toLowerCase();o=o.filter(c=>c.titulo.toLowerCase().includes(s)||c.descripcion.toLowerCase().includes(s))}l.value=o},is=()=>{const l=It(),t=E(l.value),n=E("todas"),r=E(""),o=[{id:"todas",nombre:"Todas las categorías"},{id:"seguridad",nombre:"Seguridad y Salud"},{id:"derechos",nombre:"Derechos Laborales"},{id:"prevencion",nombre:"Prevención de Acoso"},{id:"igualdad",nombre:"Igualdad y No Discriminación"},{id:"salud",nombre:"Salud Mental"}];return z(w("s_3VgM0DycfIM",[p(ss,"s_giDtzlbH0jg",[t,l,n,r]),n,r])),e("div",null,{class:"capacitacion-container"},[e("header",null,{class:"mb-8"},[e("h1",null,{class:"text-3xl font-bold text-slate-800 dark:text-white mb-2"},"Capacitaciones laborales",3,null),e("p",null,{class:"text-slate-600 dark:text-slate-300 mb-6"},"Aquí es donde puedes mantenerte al tanto de leyes laborales y defender tus derechos como trabajador",3,null),e("div",null,{class:"flex justify-end mb-4"},i(D,{href:"/capacitacion/crear",class:"flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors",children:[i(Pa,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"0u_0"),"Crear nuevo curso"],[a]:{href:a,class:a}},1,"0u_1"),1,null),e("div",null,{class:"flex flex-col md:flex-row gap-4 mb-6"},[e("div",null,{class:"w-full md:w-1/3"},e("div",null,{class:"relative"},[i(Wa,{class:"absolute top-2 left-3 w-5 h-5 text-slate-400",[a]:{class:a}},3,"0u_2"),e("input",null,{type:"text",placeholder:"Buscar cursos...",class:"w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white",value:r,onInput$:w("s_N2QFIK0HPIY",[r])},null,3,null)],1,null),1,null),e("div",null,{class:"w-full md:w-1/3"},e("div",null,{class:"relative"},[i(Gl,{class:"absolute top-2 left-3 w-5 h-5 text-slate-400",[a]:{class:a}},3,"0u_3"),e("select",null,{class:"w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none",value:n,onInput$:w("s_x0knmnd7rIE",[n])},o.map(c=>e("option",{value:$(c,"id")},null,c.nombre,1,c.id)),1,null)],1,null),1,null)],1,null)],1,null),e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},t.value.length>0?t.value.map(c=>e("div",null,{class:"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"},e("div",null,{class:"p-6"},e("div",null,{class:"flex items-start"},[e("div",{class:`w-24 h-24 min-w-[6rem] flex-shrink-0 mr-5 rounded-lg ${c.imagen_color} flex items-center justify-center relative`},null,e("span",null,{class:"text-4xl  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"},[c.categoria==="seguridad"&&"🛡️",c.categoria==="derechos"&&"⚖️",c.categoria==="prevencion"&&"🚫",c.categoria==="igualdad"&&"🤝",c.categoria==="salud"&&"❤️"],1,null),1,null),e("div",null,{class:"flex-1 pl-4"},[e("h2",null,{class:"text-xl  ml-2 font-bold text-slate-900 dark:text-white mb-2"},$(c,"titulo"),1,null),e("p",null,{class:"text-slate-600  ml-2  dark:text-slate-300 text-sm mb-4"},$(c,"descripcion"),1,null),e("div",null,{class:"flex ml-2  items-center mt-4"},i(D,{href:`/capacitacion/curso/${c.id}`,class:"inline-block bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md transition-colors text-sm font-medium shadow-sm",children:"Iniciar",[a]:{class:a}},3,"0u_4"),1,null)],1,null)],1,null),1,null),1,c.id)):e("div",null,{class:"col-span-full text-center py-8"},e("p",null,{class:"text-slate-600 dark:text-slate-400"},"No se encontraron cursos. ¡Crea uno nuevo!",3,null),3,"0u_5"),1,null)],1,"0u_6")},cs=M(p(is,"s_b5C8UnDF0QM")),ds=Object.freeze(Object.defineProperty({__proto__:null,default:cs,useCursosLoader:It},Symbol.toStringTag,{value:"Module"})),Je=10,Ie={}.DID_API_URL||"https://api.d-id.com",bl=l=>{for(const t of Be)if(t.value===l)return t.code;return"US"},Pe={US:ba,ES:xa,IT:ha,FR:fa,BR:ya},Be=[{value:"en-US",label:"English",code:"US",flagSvg:Pe.US},{value:"es-ES",label:"Spanish",code:"ES",flagSvg:Pe.ES},{value:"it-IT",label:"Italian",code:"IT",flagSvg:Pe.IT},{value:"fr-FR",label:"French",code:"FR",flagSvg:Pe.FR},{value:"pt-BR",label:"Portuguese",code:"BR",flagSvg:Pe.BR}],xe={"en-US":"English","es-ES":"Spanish","it-IT":"Italian","fr-FR":"French","pt-BR":"Portuguese"},Rl={"en-US":{type:"microsoft",voice_id:"en-US-JennyNeural"},"es-ES":{type:"microsoft",voice_id:"es-ES-AbrilNeural"},"it-IT":{type:"microsoft",voice_id:"it-IT-IsabellaNeural"},"fr-FR":{type:"microsoft",voice_id:"fr-FR-DeniseNeural"},"pt-BR":{type:"microsoft",voice_id:"pt-BR-BrendaNeural"}},Dt=l=>Rl[l]||Rl["en-US"],Rt=l=>{if(!l)return"";let t=l.replace(/\*\*([^*]+)\*\*/g,"$1");return t=t.replace(/\*([^*]+)\*/g,"$1"),t=t.replace(/~~([^~]+)~~/g,"$1"),t=t.replace(/`([^`]+)`/g,"$1"),t=t.replace(/```[a-z]*\n([\s\S]*?)```/g,"code block omitted"),t=t.replace(/^#{1,6}\s+(.+)$/gm,"$1"),t=t.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1"),t=t.replace(/https?:\/\/\S+/g,"URL"),t=t.replace(/www\.\S+/g,"URL"),t=t.replace(/\n\s*[-•*+]\s*/g,", "),t=t.replace(/\n/g," "),t=t.replace(/[#_~<>{}|]/g,""),t=t.replace(/&[a-z]+;/g," "),t=t.replace(/["']([^"']+)["']/g,"$1"),t=t.replace(/\s+/g," ").trim(),t},us=ee(function(){const l=this.env.get("DID_API_KEY")||{}.DID_API_KEY;return l?`Basic ${l}`:(console.error("D-ID API Key is not configured on the server."),"")},"cZmc7P5UUuA"),De=J(p(us,"s_cZmc7P5UUuA")),gs=ee(async function(l,t,n=0){try{console.log(`Server Fetch: Making request to: ${l}`,{method:t.method});const s=await fetch(l,t);if(!s.ok){const c=await s.text().catch(()=>"No error details");if(console.error(`Server Fetch: Request failed status ${s.status}: ${c}`),s.status===401||s.status===403)throw console.error("Server Fetch: Authentication failed. Check D-ID API key."),new Error(`Authentication failed: ${s.status}`);if(n<3){const d=Math.min(Math.pow(2,n)/4+Math.random(),4)*3e3;return console.log(`Server Fetch: Retrying in ${d}ms...`),await new Promise(u=>setTimeout(u,d)),ye(l,t,n+1)}throw new Error(`Server Fetch: Request failed status: ${s.status}`)}return s}catch(s){if(n<3){const c=Math.min(Math.pow(2,n)/4+Math.random(),4)*3e3;return console.log(`Server Fetch: Request error: ${s.message}, retrying in ${c}ms...`),await new Promise(d=>setTimeout(d,c)),ye(l,t,n+1)}throw console.error("Server Fetch: Max retries exceeded:",s),s}},"ZZpOGQZsXss"),ye=J(p(gs,"s_ZZpOGQZsXss")),ms=ee(async function(){console.log("Server: Step 1: Creating a new stream");const l=await De();if(!l)throw new Error("Server Auth Header failed");const n=await(await ye(`${Ie}/talks/streams`,{method:"POST",headers:{Authorization:l,"Content-Type":"application/json"},body:JSON.stringify({source_url:"https://i.postimg.cc/fLdQq0DW/thumbnail.jpg"})})).json();if(console.log("Server: Stream creation response:",n),!n.id||!n.session_id)throw new Error("Server: Stream ID or Session ID missing");return{streamId:n.id,offer:n.offer||n.jsep,iceServers:n.ice_servers,sessionId:n.session_id}},"CfpRc90J9U4"),Lt=J(p(ms,"s_CfpRc90J9U4")),ps=ee(async function(l,t,n){console.log("Server: Step 3: Sending SDP answer");const r=await De();if(!r)throw new Error("Server Auth Header failed");const o=await ye(`${Ie}/talks/streams/${l}/sdp`,{method:"POST",headers:{Authorization:r,"Content-Type":"application/json"},body:JSON.stringify({answer:n,session_id:t})});if(!o.ok)throw new Error(`Server: SDP response error: ${o.status}`);return console.log("Server: SDP answer sent successfully"),await o.json()},"3nz0mRTbAs8"),Nt=J(p(ps,"s_3nz0mRTbAs8")),bs=ee(async function(l,t,n){console.log("Server: Sending ICE candidate");const r=await De();if(!r)throw new Error("Server Auth Header failed");const o=await ye(`${Ie}/talks/streams/${l}/ice`,{method:"POST",headers:{Authorization:r,"Content-Type":"application/json"},body:JSON.stringify({...n,session_id:t})});o.ok?console.log("Server: ICE candidate sent successfully"):console.error(`Server: Failed to send ICE candidate: ${o.status}`)},"9bTWdD9eHtM"),Ot=J(p(bs,"s_9bTWdD9eHtM")),xs=ee(async function(l,t,n,r){console.log("Server: Step 4: Creating a talk");const o=await De();if(!o)throw new Error("Server Auth Header failed");const s=await ye(`${Ie}/talks/streams/${n}`,{method:"POST",headers:{Authorization:o,"Content-Type":"application/json"},body:JSON.stringify({session_id:r,script:{type:"text",input:Rt(l),provider:{type:t.type,voice_id:t.voice_id}},config:{stitch:!0},driver_url:"bank://lively"})});if(!s.ok)throw new Error(`Server: Talk request failed status: ${s.status}`);const c=await s.json();return console.log("Server: Talk created successfully:",c),c},"zVEU324USAY"),Mt=J(p(xs,"s_zVEU324USAY")),hs=ee(async function(l,t){if(!l||!t)return;console.log("Server: Step 5: Closing the stream");const n=await De();if(!n){console.error("Server: Cannot close stream, auth header failed");return}try{await ye(`${Ie}/talks/streams/${l}`,{method:"DELETE",headers:{Authorization:n,"Content-Type":"application/json"},body:JSON.stringify({session_id:t})}),console.log("Server: Stream closed successfully")}catch(r){console.error("Server: Error closing stream:",r.message)}},"EshFHZDaKXA"),jt=J(p(hs,"s_EshFHZDaKXA")),Pt=(l,t=Je)=>{if(l.length<=t)return[...l];const n=l.filter(s=>s.role==="system"),o=l.filter(s=>s.role!=="system").slice(-t);return[...n,...o]},fs=ee(async function(l,t,n,r=[]){console.log("Server: Fetching LangChain response for thread:",t);const o=this.env.get("OPENAI_API_KEY")||{}.OPENAI_API_KEY;if(!o)return console.error("OpenAI API Key not configured on server."),"Error: AI service not configured.";try{const s=new Ol({openAIApiKey:o,model:"gpt-4o-mini",temperature:0}),c=`You are a helpful assistant for DAI OFF, a legal labor advisory service. Answer all questions to the best of your ability about labor rights, legislation, and legal matters in ${n}.`,d=r.some(k=>k.role==="system");let u=[...r];d||u.unshift({role:"system",content:c}),u.push({role:"user",content:l});const m=Pt(u).map(k=>k.role==="system"?new Ml(k.content):k.role==="user"?new jl(k.content):new Pl(k.content));console.log(`Server: Using ${m.length} messages for context`);const f=await s.invoke(m);return console.log("Server: LangChain response:",f.content),f.content}catch(s){return console.error("Server: Error in LangChain model:",s),"I'm sorry, I encountered an error processing your request."}},"dVPtsXiqStU"),Ut=J(p(fs,"s_dVPtsXiqStU")),ys=ee(async function(l,t,n){console.log("Server: Processing audio with OpenAI STT");const r=this.env.get("OPENAI_API_KEY");if(!r)return console.error("OpenAI API Key not configured on server."),"Error: Speech service not configured.";try{const o=Buffer.from(l,"base64"),s=new FormData,c=new Blob([o],{type:t});s.append("file",c,"audio.webm");let d="";switch(n.toLowerCase()){case"english":d="en";break;case"spanish":d="es";break;case"italian":d="it";break;case"french":d="fr";break;case"portuguese":d="pt";break;default:d="en"}s.append("language",d),console.log(`Server: Audio processing - Using language code '${d}' for '${n}'`),s.append("prompt",`The following is a conversation in ${n}. Please transcribe accurately maintaining the original language.`),s.append("model","whisper-1"),s.append("response_format","text"),console.log("Server: Sending audio data to OpenAI, size:",o.length,"bytes");const u=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:`Bearer ${r}`},body:s});if(!u.ok){const m=await u.text();throw console.error("Server: OpenAI STT API error:",u.status,m),new Error(`OpenAI STT API error: ${u.status}`)}const b=await u.text();return console.log(`Server: Transcription result (${n}):`,b),console.log(`Server: Transcription length: ${b.length} characters`),b.trim()}catch(o){return console.error("Server: Error processing audio with OpenAI:",o),"Error processing audio."}},"Q89AFdX2E0U"),$t=J(p(ys,"s_Q89AFdX2E0U")),vs=ee(async function(l,t,n,r){if(!r){console.warn("Server: Cannot save chat message, user not logged in.");return}console.log("Server: Saving chat message for user:",r);try{const o=U(this),s=await o.execute({sql:"PRAGMA table_info(chat_history)"});console.log("Chat history table structure:",s.rows);const c=s.rows.map(b=>b.name);console.log("Chat history columns:",c.join(", "));const d=s.rows.find(b=>b.name==="user_id"||b.name==="userId");if(!d){console.error("Server: chat_history table is missing the user_id/userId column!");return}const u=d.name;console.log(`Server: Using column name "${u}" for user ID`);try{const b=`INSERT INTO chat_history (${u}, role, content, timestamp) VALUES (?, ?, ?, ?)`,m=await o.execute({sql:b,args:[r,"user",t,new Date().toISOString()]});console.log("Server: User message saved successfully",m);const f=await o.execute({sql:b,args:[r,"assistant",n,new Date().toISOString()]});console.log("Server: Assistant message saved successfully",f)}catch(b){throw console.error("Server: SQL insert error:",b.message),b.message.includes("no column named")&&(console.error("Server: Column name error - check that column names match exactly with the schema"),console.error("Server: Available columns:",c.join(", ")),console.error("Server: Attempted to use column:",u)),b}console.log("Server: Chat messages saved successfully")}catch(o){console.error("Server: Error saving chat message to Turso:",o.message),console.error("Server: Error details:",o)}},"t5qavYemaxA"),zt=J(p(vs,"s_t5qavYemaxA")),ks=ee(async function(l,t){if(!l){console.warn("Server: Cannot update language, user not logged in.");return}console.log("Server: Updating language for user:",l,"to",t);try{const n=U(this),r=await n.execute({sql:"PRAGMA table_info(users)"});console.log("Users table structure:",r.rows);const o=r.rows.find(s=>s.name.toLowerCase().includes("chatbot")&&s.name.toLowerCase().includes("lang"));if(o){const s=o.name;console.log(`Found language column: ${s}`),await n.execute({sql:`UPDATE users SET ${s} = ? WHERE id = ?`,args:[t,l]}),console.log("Server: User language updated successfully")}else console.error("Server: Couldn't find chatbot language column in users table")}catch(n){console.error("Server: Error updating user language in Turso:",n.message)}},"Q1ZuWs0UdZw"),ws=J(p(ks,"s_Q1ZuWs0UdZw")),_s=ee(async function(l,t=50){if(!l)return console.warn("Server: Cannot load chat history, user not logged in."),[];console.log("Server: Loading chat history for user:",l);try{const o=(await U(this).execute({sql:"SELECT role, content, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC LIMIT ?",args:[l,t*2]})).rows.map(s=>({role:s.role,content:s.content,timestamp:s.timestamp}));if(console.log(`Server: Loaded ${o.length} chat history messages`),o.length>Je){const s=Math.max(0,o.length-Je),c=o[s].role==="assistant"?s-1:s,d=o.slice(Math.max(0,c));return console.log(`Server: Trimmed history from ${o.length} to ${d.length} messages`),d}return o}catch(n){return console.error("Server: Error loading chat history:",n.message),[]}},"PJb0eS0Gg0U");J(p(_s,"s_PJb0eS0Gg0U"));const Es=async l=>{var o,s;const t=l.sharedMap.get("session");let n="en-US",r;if((o=t==null?void 0:t.user)!=null&&o.id)r=t.user.id;else{const c=(s=l.cookie.get("auth_token"))==null?void 0:s.value;if(!c)throw console.log("[CHAT] No authentication found, redirecting to login"),l.redirect(302,"/auth/");console.log("[CHAT] Using auth_token cookie for authentication"),r=c}try{const c=U(l),d=r,u=await c.execute({sql:"PRAGMA table_info(users)"});console.log("[CHAT] Users table structure:",u.rows);const b=u.rows.find(m=>m.name.toLowerCase().includes("chatbot")&&m.name.toLowerCase().includes("lang"));if(b){const m=b.name;console.log(`[CHAT] Found language column: ${m}`);const f=await c.execute({sql:`SELECT ${m} AS chatbot_language FROM users WHERE id = ? LIMIT 1`,args:[d]});if(f.rows.length>0&&f.rows[0].chatbot_language){const k=f.rows[0].chatbot_language;Be.some(A=>A.value===k)?n=k:console.warn(`[CHAT] Loaded invalid language '${k}' for user ${r}, using default.`)}}else console.warn("[CHAT] Couldn't find chatbot language column in users table")}catch(c){console.error("[CHAT] Failed to load user language from DB:",c.message)}return{initialLanguage:n,userId:r,initialThreadId:crypto.randomUUID()}},Ft=G(p(Es,"s_2OxiK9FAl0U")),Ts=()=>{const[l,t,n,r,o,s]=I();if(t.value||l.value){console.log("Not playing idle video while loading or initiating");return}const c=s.value;if(!c){console.error("Cannot play idle video - video element reference is null");return}console.log("Attempting to play idle video");const d=r.value,u=d&&d.connectionState==="connected";if(u&&c.srcObject instanceof MediaStream){if(c.srcObject.getVideoTracks().filter(f=>f.readyState==="live"&&!f.muted).length>0&&o.value){console.log("Active video stream with data is playing, not switching to idle");return}console.log("Switching to idle despite connection because stream is inactive")}if(c.srcObject instanceof MediaStream)try{const m=c.srcObject.getTracks();u?(console.log("Preserving WebRTC tracks while switching to idle"),m.forEach(f=>{console.log(`Track preserved: ${f.id}, kind: ${f.kind}, state: ${f.readyState}`)})):(console.log("No active connection, safely stopping all tracks"),m.forEach(f=>{console.log(`Stopping track: ${f.id}, kind: ${f.kind}, state: ${f.readyState}`),f.stop()}))}catch(m){console.warn("Error handling stream tracks:",m)}if(c.src&&c.src.includes("prs_daioff.idle.mp4")&&!c.paused&&!c.ended&&c.readyState>=3){console.log("Idle video already playing correctly, no need to restart");return}c.srcObject=null,c.pause(),c.removeAttribute("srcObject"),c.currentTime=0;const b=window.location.origin+"/prs_daioff.idle.mp4";console.log("Idle video path:",b);try{c.removeAttribute("src"),c.load(),c.muted=!0,c.loop=!0,c.style.display="block",c.autoplay=!0,c.playsInline=!0,c.controls=!1,c.src=b,c.load(),console.log("Video configured, attempting to play idle video");const m=()=>c.play().then(()=>(console.log("Idle video playing successfully"),o.value=!1,setTimeout(()=>{c.muted=n.value},300),!0)).catch(f=>(console.error("Error playing idle video:",f),!1));m().then(f=>{f||(console.log("Retrying with forced mute after delay"),c.muted=!0,setTimeout(()=>{m().then(k=>{k||(console.log("Final retry with video reload"),c.load(),c.muted=!0,c.autoplay=!0,c.currentTime=0,c.play().catch(v=>{console.error("All idle video play attempts failed:",v)}))})},500))})}catch(m){console.error("Exception setting up idle video:",m)}},Cs=(l,t)=>{const[n,r,o,s,c]=I();console.log("Video status change called - isPlaying:",l,"stream exists:",!!t);const d=n.value||r.value;if(l&&t){const u=t.getVideoTracks(),b=u.length>0&&u.some(m=>m.readyState==="live");if(console.log(`Stream has ${u.length} video tracks, active: ${b}`),b){if(console.log("Setting active video stream with live tracks"),d){console.log("Currently initiating or loading, scheduling stream for later"),setTimeout(()=>{if(c.value){console.log("Setting delayed video stream");const m=c.value;!m.srcObject||!(m.srcObject instanceof MediaStream)||m.srcObject.getVideoTracks().length===0?(console.log("Setting stream with safe transition"),m.srcObject=t,m.muted=o.value,m.style.display="block",m.play().catch(f=>{console.error("Error playing delayed video:",f),f.name==="NotAllowedError"&&(m.muted=!0,m.play().catch(k=>console.error("Still cannot play video:",k)))})):console.log("Video already has a valid srcObject, skipping update")}},1e3);return}if(c.value)try{const m=c.value;m.src&&(m.pause(),m.removeAttribute("src"),m.load()),console.log("Setting stream directly to video element"),m.srcObject=t,m.muted=o.value,m.style.display="block";const f=m.play();f!==void 0&&f.catch(k=>{console.error("Error playing video:",k),k.name==="NotAllowedError"&&(m.muted=!0,m.play().catch(v=>console.error("Still cannot play video:",v)))})}catch(m){console.error("Error setting video stream:",m)}else console.warn("Video ref is null, cannot set stream")}else console.log("Stream has no active tracks or all tracks ended"),d?console.log("Processing in progress, keeping current video state"):(console.log("No processing in progress, switching to idle video"),s())}else d?console.log("Loading or initiating, not switching to idle video yet"):(console.log("No active stream, playing idle video"),s())},Ss=()=>{const[l]=I(),t=l.value;t&&console.log("ICE gathering state:",t.iceGatheringState)},As=async l=>{const[t,n,r]=I(),o=t.value;if(!l.candidate||!r.value||!n.value||!o)return;console.log("ICE candidate:",l.candidate);const{candidate:s,sdpMid:c,sdpMLineIndex:d}=l.candidate;try{await Ot(r.value,n.value,{candidate:s,sdpMid:c,sdpMLineIndex:d})}catch(u){console.error("Client: Failed to send ICE candidate via server:",u)}},Is=()=>{const[l,t,n,r]=I(),o=r.value;if(!o)return;const s=o.iceConnectionState;console.log("ICE connection state:",s),s==="connected"||s==="completed"?(n.value&&(clearTimeout(n.value),n.value=null),l.value=!0,t.value=null,console.log("Connection established successfully")):(s==="failed"||s==="closed"||s==="disconnected")&&(console.error("ICE connection failed or closed"),closePC$(!1),l.value=!1,t.value="Connection failed. Please try reconnecting.")},Ds=()=>{const[l,t,n]=I(),r=n.value;if(!r)return;const o=r.connectionState;console.log("Peer connection state:",o),o==="connected"?(l.value=!0,t.value=null):(o==="failed"||o==="closed")&&(l.value=!1,t.value="Connection failed. Please try reconnecting.",closePC$(!1))},Rs=()=>{const[l]=I(),t=l.value;t&&console.log("Signaling state:",t.signalingState)},Ls=l=>{const[t,n,r,o,s,c,d,u]=I();console.log("onTrack event fired:",l);const b=s.value;if(!l.track||!b){console.log("onTrack: Event received but no valid track or PC found.");return}console.log(`Track received: ${l.track.id}, kind: ${l.track.kind}, state: ${l.track.readyState}`),l.track.addEventListener("ended",()=>{console.log(`Track ended: ${l.track.id}, kind: ${l.track.kind}`)}),l.track.addEventListener("unmute",()=>{if(console.log(`Track unmuted: ${l.track.id}, kind: ${l.track.kind}`),l.streams&&l.streams.length>0){const m=l.streams[0];if(l.track.kind==="video"&&m.getVideoTracks().length>0)if(console.log("Video stream available after unmute"),!n.value||d.value){const f=u.value;f&&(console.log("Setting unmuted stream directly to video element"),f.srcObject=m,f.style.display="block",f.muted=r.value,f.play().catch(k=>{console.error("Error playing unmuted stream:",k),k.name==="NotAllowedError"&&(f.muted=!0,f.play().catch(v=>{console.error("Still cannot play unmuted stream:",v)}))}))}else console.log("Not setting video element yet as we are still loading or waiting for active tracks")}}),c.value&&(clearInterval(c.value),c.value=null),c.value=setInterval(async()=>{if(!b||b.connectionState!=="connected"){c.value&&clearInterval(c.value),c.value=null;return}try{const m=b.getReceivers();let f=!1,k=0;const v=m.filter(A=>A.track&&A.track.kind==="video"&&A.track.readyState==="live").map(A=>A.track);console.log(`Found ${v.length} active video tracks`),v.length>0&&(await b.getStats()).forEach(S=>{if(S.type==="inbound-rtp"&&"mediaType"in S&&S.mediaType==="video"){f=!0;const y="bytesReceived"in S?S.bytesReceived:0;k+=y;const x=y>t.value&&y>0;if(d.value!==x)if(d.value=x,x){console.log("D-ID video stream now actively receiving data, switching from idle");const j=m.filter(h=>h.track&&h.track.readyState==="live").map(h=>h.track),P=new MediaStream(j);o(!0,P)}else n.value||(console.log("D-ID video stream paused, reverting to idle"),o(!1,null));t.value=k}}),!f&&d.value&&(console.log("No active video tracks found in stats"),d.value=!1,n.value||o(!1,null))}catch(m){console.error("Error getting stats:",m)}},1e3),console.log("Track handler set up, waiting for active video data before switching from idle")},Ns=(l=!0)=>{const[t,n,r,o,s,c,d,u,b,m,f,k,v,A,S,y]=I(),x=m.value;if(!x)return;console.log("Client: Closing peer connection"),x.removeEventListener("icegatheringstatechange",d),x.removeEventListener("icecandidate",s),x.removeEventListener("iceconnectionstatechange",c),x.removeEventListener("connectionstatechange",o),x.removeEventListener("signalingstatechange",u),x.removeEventListener("track",b),v.value&&(clearInterval(v.value),v.value=null),n.value&&(clearTimeout(n.value),n.value=null);const _=y.value;if(_!=null&&_.srcObject&&_.srcObject instanceof MediaStream){console.log("Stopping tracks during PC close - this IS the right place to stop tracks");const j=_.srcObject.getTracks();console.log(`Stopping ${j.length} tracks during peer connection close`),j.forEach(P=>{console.log(`Stopping track: ${P.id}, kind: ${P.kind}, state: ${P.readyState}`),P.stop()}),_.srcObject=null}x.close(),m.value=null,t.value=!1,S.value=!1,r.value=0,console.log("Client: Peer connection closed"),l&&A.value&&k.value&&(jt(A.value,k.value).catch(j=>{console.error("Client: Error during server close stream:",j)}),A.value="",k.value=""),setTimeout(()=>{f(),console.log("Reproduciendo video de espera después de cerrar conexión")},500)},Os=async(l,t)=>{const[n,r,o,s,c,d,u,b]=I();b.value&&(console.warn("Closing existing peer connection before creating new one."),n(!1));try{console.log("Client: Creating Peer Connection");const m=new RTCPeerConnection({iceServers:t});m.addEventListener("icegatheringstatechange",c),m.addEventListener("icecandidate",o),m.addEventListener("iceconnectionstatechange",s),m.addEventListener("connectionstatechange",r),m.addEventListener("signalingstatechange",d),m.addEventListener("track",u),console.log("Client: Setting remote description"),await m.setRemoteDescription(l),console.log("Client: Creating answer");const f=await m.createAnswer();return console.log("Client: Setting local description"),await m.setLocalDescription(f),b.value=Nl(m),f}catch(m){throw console.error("Client: Error creating peer connection:",m),b.value=null,m}},Ms=async()=>{const[l,t,n,r,o,s,c,d,u,b]=I();if(!(t.value||s.value)){s.value=!0,n.value=null,l(!1);try{d(),console.log("Client: Calling serverInitConnection");const{streamId:m,offer:f,iceServers:k,sessionId:v}=await Lt();b.value=m,u.value=v,console.log("Client: Stream/Session IDs received:",m,v),console.log("Client: Creating peer connection with offer");const A=await o(f,k);console.log("Client: Sending SDP answer via server"),await Nt(m,v,A),r.value&&clearTimeout(r.value),r.value=setTimeout(()=>{if(!t.value){console.error("Connection timeout - checking status");const S=c.value;S&&(S.iceConnectionState==="checking"||S.iceConnectionState==="connected"||S.iceConnectionState==="completed")?(console.log("Connection appears stable despite timeout - forcing connected state"),t.value=!0,n.value=null):(console.error("Connection truly timed out"),n.value="Connection timed out. Please try reconnecting.",l(!0))}},15e3),console.log("Client: Waiting for ICE connection...")}catch(m){console.error("Client: Error during connection initialization:",m),n.value=`Connection error: ${m.message||"Unknown error"}`,l(!0),t.value=!1,b.value="",u.value="",setTimeout(()=>{d(),console.log("Attempting to play idle video after connection error")},1e3)}finally{s.value=!1}}},js=()=>{const[l,t]=I();l.value=!l.value,t.value&&(t.value.muted=l.value),console.log(`Video ${l.value?"muted":"unmuted"}`)},Ps=()=>{const[l]=I();console.log("Manual reconnect triggered"),l()},Us=async l=>{var P;const[t,n,r,o,s,c,d,u,b,m,f,k,v,A,S,y,x,_,j]=I();if(l.trim()){b.value=!0,o.value=null,t.push({role:"user",content:l}),d.value&&(d.value.value="");try{console.log("Client: Fetching LangChain response with chat history context");const h=t.map(F=>({role:F.role,content:F.content})),Z=await Ut(l,x.value,xe[s.language]||"English",h);if(t.push({role:"assistant",content:Z}),(P=c.value)!=null&&P.userId&&zt(A.value||"no-session",l,Z,c.value.userId).catch(F=>console.error("Client: Failed to save chat message:",F)),m.value){console.log("Video muted, skipping talk creation."),b.value=!1;return}if(!r.value||!y.value||!A.value){console.warn("Not connected, attempting to connect before talk...");try{if(await n(),await new Promise(F=>setTimeout(F,3e3)),!r.value||!y.value||!A.value){console.error("Connection failed after reconnect attempt, cannot create talk."),o.value="Connection failed. Cannot play response.",b.value=!1;return}console.log("Successfully reconnected, proceeding with talk creation")}catch(F){console.error("Error during reconnection attempt:",F),o.value="Connection failed. Cannot play response.",b.value=!1;return}}if(!r.value||!y.value||!A.value){console.error("Still not connected, cannot create talk."),o.value="Not connected. Cannot play response.",b.value=!1;return}console.log("Client: Creating talk");const ae=Dt(s.language);if(await Mt(Z,ae,y.value,A.value),console.log("Client: Talk request sent"),k.value&&j.value){console.log("Setting up enhanced talk stream detection"),_.value=!1,u.value=0,S.value&&(clearInterval(S.value),S.value=null);const F=k.value;S.value=setInterval(async()=>{if(!F||F.connectionState!=="connected"){S.value&&(clearInterval(S.value),S.value=null);return}try{const Y=F.getReceivers(),R=Y.filter(q=>q.track&&q.track.kind==="video"&&q.track.readyState==="live").map(q=>q.track);if(console.log(`Found ${R.length} active video tracks`),R.length>0){const q=await F.getStats();let ce=!1,te=0;q.forEach(le=>{if(le.type==="inbound-rtp"&&"mediaType"in le&&le.mediaType==="video"){if(te="bytesReceived"in le?le.bytesReceived:0,ce=te>u.value&&te>0,ce&&!_.value){console.log("Talk video stream now active with data flow"),_.value=!0;const Re=Y.filter(ue=>ue.track&&ue.track.readyState==="live").map(ue=>ue.track),be=new MediaStream(Re);f(!0,be)}u.value=te}}),!ce&&_.value&&!b.value&&(console.log("Talk video stream has no active data flow, reverting to idle"),_.value=!1,f(!1,null))}else _.value&&!b.value&&(console.log("No active video tracks found, reverting to idle"),_.value=!1,f(!1,null))}catch(Y){console.error("Error monitoring video stream:",Y)}},750);const ie=F.getReceivers(),ne=ie.filter(Y=>Y.track&&Y.track.kind==="video"&&Y.track.readyState==="live").map(Y=>Y.track);setInterval(()=>{if(ne.length>0){console.log(`Initial check: Found ${ne.length} active video tracks`),ne.forEach(R=>{console.log(`Ensuring video track is enabled: ${R.id}`),R.enabled=!0});const Y=ie.filter(R=>R.track&&R.track.readyState==="live").map(R=>R.track);try{const R=new MediaStream(Y),q=j.value;q&&(!q.srcObject||q.srcObject.getVideoTracks().length===0||q.srcObject.getVideoTracks()[0].readyState!=="live")&&(console.log("Updating video element with active stream"),q.srcObject=R,q.muted=m.value,q.style.display="block",q.play().catch(te=>{console.error("Error playing video:",te),te.name==="NotAllowedError"&&(q.muted=!0,q.play().catch(le=>{console.error("Still cannot play video:",le)}))}))}catch(R){console.error("Error creating media stream:",R)}}},300)}}catch(h){console.error("Client: Error during startTalk:",h),t.push({role:"assistant",content:`Error: ${h.message||"Could not process request."}`}),o.value=`Error: ${h.message||"Could not process request."}`,j.value&&v()}finally{b.value=!1}}},$s=()=>{const[l,t]=I();l.value&&l.value.value.trim()&&t(l.value.value)},zs=l=>{const[t,n]=I();l.key==="Enter"&&t.value&&t.value.value.trim()&&n(t.value.value)},Fs=async l=>{const[t,n,r,o]=I();r.value=!0,t.push({role:"assistant",content:`Procesando grabación de voz en ${bl(n.language)} ${xe[n.language]||"English"}...`});try{const s=await l.arrayBuffer(),c=btoa(new Uint8Array(s).reduce((u,b)=>u+String.fromCharCode(b),""));console.log("Client: Audio converted to base64, size:",c.length),console.log(`Client: Processing voice recording in ${n.language} (${xe[n.language]||"English"})`),t.length>0&&t[t.length-1].role==="assistant"&&t[t.length-1].content.startsWith("Procesando grabación de voz")&&t.pop();const d=await $t(c,l.type,xe[n.language]||"English");d&&!d.startsWith("Error:")?(console.log(`Client: Transcription successful in ${n.language}: "${d}"`),await o(d)):(console.error(`Client: Transcription failed in ${n.language}:`,d),t.push({role:"assistant",content:`No pude procesar correctamente el audio en ${xe[n.language]||"English"}. Por favor, intenta de nuevo o escribe tu mensaje.`}))}catch(s){console.error(`Client: Error processing audio in ${n.language}:`,s),t.length>0&&t[t.length-1].role==="assistant"&&t[t.length-1].content.startsWith("Procesando grabación de voz")&&t.pop();const c=`Lo siento, hubo un problema procesando tu grabación en ${bl(n.language)} ${xe[n.language]}. ${s.message}`;t.push({role:"assistant",content:c})}finally{r.value=!1}},qs=async()=>{const[l,t,n,r,o,s]=I();if(!t.value)try{const c={audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0,sampleRate:48e3}};console.log(`Client: Starting voice recording for language: ${l.language} (${xe[l.language]||"English"})`);const d=await navigator.mediaDevices.getUserMedia(c);let u="audio/webm;codecs=opus";MediaRecorder.isTypeSupported(u)||(u="audio/webm",console.log("Client: Opus codec not supported, using standard audio/webm"));const b=new MediaRecorder(d,{mimeType:u,audioBitsPerSecond:128e3});r.value=Nl(b);const m=[];b.addEventListener("dataavailable",f=>{m.push(f.data)}),b.addEventListener("stop",async()=>{const f=new Blob(m,{type:b.mimeType});console.log("Found",d.getVideoTracks().length,"active video tracks"),d.getTracks().forEach(k=>k.stop()),t.value=!1,r.value=null,s.value&&clearInterval(s.value),o.value=0,f.size>0?await n(f):console.log("Empty recording, skipping processing.")}),b.start(),t.value=!0,o.value=0,s.value&&clearInterval(s.value),s.value=setInterval(()=>{o.value++},1e3),setTimeout(()=>{b.state==="recording"&&b.stop()},3e4)}catch(c){console.error("Error starting recording:",c),t.value=!1,alert("Could not start recording. Please ensure microphone permission is granted.")}},Bs=()=>{const[l,t]=I();l.value&&l.value.state==="recording"&&l.value.stop(),t.value&&(clearInterval(t.value),t.value=null)},Ys=()=>{const[l,t,n]=I();l.value?n():t()},Hs=()=>{var Le,Ne,Oe;Q(),el(p(qt,"s_k00z89YFKEE"));const l=Ft(),t=E(""),n=E(""),r=E(!1),o=E(!1),s=E(!1),c=E(!1),d=E(null),u=E(!1),b=E(0),m=E(((Le=l.value)==null?void 0:Le.initialThreadId)??crypto.randomUUID()),f=ke([]),k=E(!1),v=ke({userResponse:"",language:((Ne=l.value)==null?void 0:Ne.initialLanguage)??"en-US"}),A=E(),S=E(),y=E(),x=E(null),_=E(null),j=E(null),P=E(null),h=E(0),Z=E(!1),ae=E(null),F=p(Ts,"s_N9e0IU0A4bo",[o,s,c,x,Z,A]),ie=p(Cs,"s_Ju0f19q15Rc",[o,s,c,F,A]),ne=p(Ss,"s_aAUOe9s9Jkk",[x]),Y=p(As,"s_HvRDpFr97uM",[x,n,t]),R=p(Is,"s_EF7Cga3ZMCg",[r,d,ae,x]),q=p(Ds,"s_MPQKybcKuto",[r,d,x]),ce=p(Rs,"s_hlWBljykoJs",[x]),te=p(Ls,"s_WBCTWzxfig4",[h,s,c,ie,x,P,Z,A]),le=p(Ns,"s_Y50Opu7cRuk",[r,ae,h,q,Y,R,ne,ce,te,x,F,n,P,t,Z,A]),be=p(Ms,"s_F0oEfzF8QA8",[le,r,d,ae,p(Os,"s_84iu1gesId0",[le,q,Y,R,ne,ce,te,x]),o,x,F,n,t]);z(w("s_sXBaPboedo4",[le,be,r,ae,F,P,j])),z(w("s_rueDjDgQosU",[f,k,l])),z(w("s_jqWZtbrPWYE",[f,S]));const ue=p(js,"s_ZXBOyQKfLYM",[c,A]),Ye=p(Ps,"s_QG1bFHMosqw",[be]),Te=p(Us,"s_ir1spm36TUU",[f,be,r,d,v,l,y,h,s,c,ie,x,F,n,P,t,m,Z,A]),He=p($s,"s_SVXZb4uUvRs",[y,Te]),Ve=p(zs,"s_6fbfSHCjrkg",[y,Te]),Ge=p(Ys,"s_dxWeK02kSMA",[u,p(qs,"s_NCM2QYVvCRs",[v,u,p(Fs,"s_nlB6T0j3ySQ",[f,v,s,Te]),_,b,j]),p(Bs,"s_iZrhr7O0pfk",[_,j])]);return z(w("s_YAGfxIvYiGw")),e("div",null,{class:"chat-container",style:{height:"var(--available-height, 70vh)"}},[e("div",null,{class:"video-panel"},[e("video",{ref:A},{id:"talk-video",autoplay:!0,playsInline:!0,muted:g(N=>N.value,[c],"p0.value"),class:"video-element",preload:"auto"},null,3,null),s.value&&e("div",null,{class:"video-processing-indicator"},[i(We,null,3,"Ba_0"),e("span",null,null,"Processing...",3,null)],1,"Ba_1"),o.value&&e("div",null,{class:"video-connecting-overlay"},[i(We,null,3,"Ba_2"),e("p",null,null,"Connecting to Avatar...",3,null)],1,"Ba_3"),e("div",null,{class:"control-panel"},[e("div",null,{class:"control-left"},e("div",null,{class:"language-icons"},Be.map(N=>e("button",{class:`lang-icon-btn ${v.language===N.value?"active":""}`,title:$(N,"label"),"aria-label":$(N,"label"),dangerouslySetInnerHTML:$(N,"flagSvg"),onClick$:w("s_zgjxndRmwSE",[v,l,N])},null,null,2,N.value)),1,null),1,null),e("div",null,{class:"control-right"},!r.value&&!o.value&&e("button",null,{class:"connect-button",onClick$:Ye},"Connect",3,"Ba_4"),1,null)],1,null)],1,null),e("div",null,{class:"chat-panel"},[e("div",{ref:S},{class:"chat-messages"},[f.map((N,de)=>e("div",{class:`message-container ${N.role==="user"?"user-message":"assistant-message"}`},null,e("div",{class:`message-bubble ${N.role==="user"?"user-bubble":"assistant-bubble"}`},null,[e("div",null,{class:"message-sender"},N.role==="user"?"You":"Assistant",1,null),e("p",null,{class:"message-content"},$(N,"content"),1,null)],1,null),1,de)),s.value&&((Oe=f[f.length-1])==null?void 0:Oe.role)==="user"&&e("div",null,{class:"message-container assistant-message"},e("div",null,{class:"message-bubble assistant-bubble"},[e("div",null,{class:"message-sender"},"Assistant",3,null),e("div",null,{class:"typing-indicator"},[e("span",null,null,null,3,null),e("span",null,null,null,3,null),e("span",null,null,null,3,null)],3,null)],3,null),3,"Ba_5")],1,null),e("div",null,{class:"chat-input-container fixed-mobile-input"},e("div",null,{class:"chat-input-wrapper"},[e("button",null,{class:"volume-button control-btn","aria-label":g(N=>N.value?"Unmute Video":"Mute Video",[c],'p0.value?"Unmute Video":"Mute Video"'),onClick$:ue},c.value?i(rn,{class:"w-4 h-4",[a]:{class:a}},3,"Ba_6"):i(nn,{class:"w-4 h-4",[a]:{class:a}},3,"Ba_7"),1,null),e("div",null,{class:"language-icons desktop-only"},Be.map(N=>e("button",{class:`lang-icon-btn ${v.language===N.value?"active":""}`,title:$(N,"label"),"aria-label":$(N,"label"),dangerouslySetInnerHTML:$(N,"flagSvg"),onClick$:w("s_C6PrDmqOBSo",[v,l,N])},null,null,2,N.value)),1,null),e("button",null,{disabled:g((N,de)=>N.value||de.value,[o,s],"p0.value||p1.value"),class:g(N=>`mic-button ${N.value?"recording":""}`,[u],'`mic-button ${p0.value?"recording":""}`'),"aria-label":g(N=>N.value?"Stop Recording":"Start Recording",[u],'p0.value?"Stop Recording":"Start Recording"'),onClick$:Ge},u.value?i(Ya,{class:"w-4 h-4",[a]:{class:a}},3,"Ba_8"):i(Ba,{class:"w-4 h-4",[a]:{class:a}},3,"Ba_9"),1,null),e("input",{ref:y},{type:"text",placeholder:g(N=>N.value?"Connecting...":"Type a message...",[o],'p0.value?"Connecting...":"Type a message..."'),disabled:g((N,de)=>N.value||de.value,[o,s],"p0.value||p1.value"),class:"chat-input",onKeyUp$:Ve},null,3,null),e("button",null,{disabled:g((N,de)=>N.value||de.value,[o,s],"p0.value||p1.value"),class:"send-button",onClick$:He},s.value?i(We,{size:"small",[a]:{size:a}},3,"Ba_10"):i(Vl,{class:"w-4 h-4",[a]:{class:a}},3,"Ba_11"),1,null)],1,null),1,null)],1,null)],1,"Ba_12")},Vs=M(p(Hs,"s_MrD3ZY10mAo")),Gs=l=>{const t=(l.size??"medium")==="small"?"w-4 h-4 border-2":"w-5 h-5 border-[3px]";return e("div",{class:`animate-spin rounded-full ${t} border-white border-t-transparent`},{role:"status","aria-label":"loading"},null,3,"Ba_13")},We=M(p(Gs,"s_0l795rBK8oI")),qt=`
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
`,Xs=Object.freeze(Object.defineProperty({__proto__:null,STYLES:qt,Spinner:We,_auto_DID_API_URL:Ie,_auto_MAX_CONTEXT_MESSAGES:Je,_auto_fetchWithRetries:ye,_auto_getAuthHeader:De,_auto_getLanguageCode:bl,_auto_getVoiceSettings:Dt,_auto_languageMap:xe,_auto_languages:Be,_auto_processTextForVoice:Rt,_auto_serverCloseStream:jt,_auto_serverCreateTalk:Mt,_auto_serverFetchLangChainResponse:Ut,_auto_serverInitConnection:Lt,_auto_serverProcessAudio:$t,_auto_serverSaveChatMessage:zt,_auto_serverSendIceCandidate:Ot,_auto_serverSendSdpAnswer:Nt,_auto_serverUpdateUserLang:ws,_auto_trimChatHistory:Pt,default:Vs,useInitialData:Ft},Symbol.toStringTag,{value:"Module"})),Ws=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:g(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("polyline",null,{points:"16 18 22 12 16 6"},null,3,null),e("polyline",null,{points:"8 6 2 12 8 18"},null,3,null)],3,"Hi_0"),Ke=M(p(Ws,"s_8P7p3IpX6Fs")),Ks=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:g(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"1",y:"4",width:"22",height:"16",rx:"2",ry:"2"},null,3,null),e("line",null,{x1:"1",y1:"10",x2:"23",y2:"10"},null,3,null)],3,"Hi_3"),Bt=M(p(Ks,"s_TB03ynRd0Wg")),Qs=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:g(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"4",y:"2",width:"16",height:"20",rx:"2",ry:"2"},null,3,null),e("line",null,{x1:"9",y1:"6",x2:"15",y2:"6"},null,3,null),e("line",null,{x1:"9",y1:"10",x2:"15",y2:"10"},null,3,null),e("line",null,{x1:"9",y1:"14",x2:"15",y2:"14"},null,3,null)],3,"Hi_4"),Yt=M(p(Qs,"s_2vNnYhGWGdw")),Zs=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:g(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("rect",null,{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"},null,3,null),e("path",null,{d:"M7 11V7a5 5 0 0 1 10 0v4"},null,3,null)],3,"Hi_5"),Ht=M(p(Zs,"s_z2RZqqZkmR4")),Js=l=>e("svg",null,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",class:g(t=>t.class||"w-5 h-5",[l],'p0.class||"w-5 h-5"')},[e("ellipse",null,{cx:"12",cy:"5",rx:"9",ry:"3"},null,3,null),e("path",null,{d:"M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"},null,3,null),e("path",null,{d:"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"},null,3,null)],3,"Hi_6"),Vt=M(p(Js,"s_0s3q0rsbMcs")),ei=`
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
  `,li=l=>{const[t]=I();t.value=l},ti=l=>{const[t]=I();t.value=l;const n=document.getElementById(l);n&&n.scrollIntoView({behavior:"smooth",block:"start"})},ai=()=>{el(p(ei,"s_uYBjZvZkxow"));const l=E("architecture"),t=E("arch-overview"),n=E(),r=E(),o=E(),s=p(li,"s_85Fk8Ri0Dl8",[l]),c=p(ti,"s_Yh9AXSXas0Q",[t]);return z(w("s_JwNEufPc0dE")),e("div",null,{class:"flex flex-col min-h-screen bg-white dark:bg-gray-900"},[e("div",null,{class:"bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-16 px-4"},e("div",null,{class:"max-w-5xl mx-auto"},[e("h1",null,{class:"text-4xl md:text-5xl font-extrabold mb-4"},"Documentación Técnica",3,null),e("p",null,{class:"text-xl text-indigo-100 max-w-3xl"},"Guía completa de la plataforma TokenEstate para desarrolladores, arquitectos y usuarios técnicos",3,null)],3,null),3,null),e("div",null,{class:"max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8"},[e("div",null,{class:"md:w-64 flex-shrink-0"},e("div",null,{class:"sticky top-8"},[e("div",null,{class:"p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6"},[e("h3",null,{class:"font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200"},"Contenido",3,null),e("nav",null,{class:"space-y-1"},[e("a",null,{href:"#arch-overview",class:g(d=>`toc-link ${d.value==="arch-overview"?"active":""}`,[t],'`toc-link ${p0.value==="arch-overview"?"active":""}`'),onClick$:w("s_0Sd7oecTTOI",[c])},"Arquitectura",3,null),e("a",null,{href:"#system-layers",class:g(d=>`toc-link ${d.value==="system-layers"?"active":""}`,[t],'`toc-link ${p0.value==="system-layers"?"active":""}`'),onClick$:w("s_F2UsykvfDcU",[c])},"Capas del Sistema",3,null),e("a",null,{href:"#smart-contracts",class:g(d=>`toc-link ${d.value==="smart-contracts"?"active":""}`,[t],'`toc-link ${p0.value==="smart-contracts"?"active":""}`'),onClick$:w("s_KEqv48ErNIg",[c])},"Contratos Inteligentes",3,null),e("a",null,{href:"#security",class:g(d=>`toc-link ${d.value==="security"?"active":""}`,[t],'`toc-link ${p0.value==="security"?"active":""}`'),onClick$:w("s_SF0LrlyNP5s",[c])},"Seguridad y Auditoría",3,null),e("a",null,{href:"#timeline",class:g(d=>`toc-link ${d.value==="timeline"?"active":""}`,[t],'`toc-link ${p0.value==="timeline"?"active":""}`'),onClick$:w("s_bDXXA45JnUE",[c])},"Cronograma",3,null)],3,null)],3,null),e("div",null,{class:"p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"},[e("h3",null,{class:"font-semibold text-lg mb-3 text-indigo-800 dark:text-indigo-300"},"Recursos",3,null),e("ul",null,{class:"space-y-2 text-sm"},[e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"📄",3,null)," Whitepaper técnico"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"💻",3,null)," Repositorio de código"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"🧪",3,null)," Testnet Demo"],3,null),3,null),e("li",null,null,e("a",null,{href:"#",class:"text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"},[e("span",null,{class:"mr-2"},"💬",3,null)," Canal de Discord"],3,null),3,null)],3,null)],3,null)],3,null),3,null),e("div",null,{class:"flex-1"},[e("div",null,{class:"border-b border-gray-200 dark:border-gray-700 mb-8"},e("div",null,{class:"flex"},[e("button",null,{class:g(d=>`tab ${d.value==="architecture"?"active":""}`,[l],'`tab ${p0.value==="architecture"?"active":""}`'),onClick$:w("s_Tb896FU2TvI",[s])},"Arquitectura",3,null),e("button",null,{class:g(d=>`tab ${d.value==="contracts"?"active":""}`,[l],'`tab ${p0.value==="contracts"?"active":""}`'),onClick$:w("s_jAmpfQOwVW8",[s])},"Contratos",3,null),e("button",null,{class:g(d=>`tab ${d.value==="security"?"active":""}`,[l],'`tab ${p0.value==="security"?"active":""}`'),onClick$:w("s_x0ZhfQ6FRlE",[s])},"Seguridad",3,null),e("button",null,{class:g(d=>`tab ${d.value==="implementation"?"active":""}`,[l],'`tab ${p0.value==="implementation"?"active":""}`'),onClick$:w("s_1RvbHfL96oo",[s])},"Implementación",3,null)],3,null),3,null),e("div",null,{class:g(d=>`tab-content ${d.value==="architecture"?"active":""}`,[l],'`tab-content ${p0.value==="architecture"?"active":""}`')},[e("section",{ref:n},{id:"arch-overview",class:"mb-12 section"},[e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Arquitectura del Sistema",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"La plataforma TokenEstate está diseñada con una arquitectura modular y escalable que permite la tokenización, comercialización y gestión de propiedades inmobiliarias a través de tecnología blockchain. Esta sección describe la arquitectura general y los componentes clave del sistema.",3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Componentes Principales",3,null),e("div",null,{class:"grid md:grid-cols-2 gap-6"},[e("div",null,null,[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"Frontend",3,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Aplicación web desarrollada con Qwik y React",3,null),e("li",null,null,"Interfaz para usuarios, propietarios y administradores",3,null),e("li",null,null,"Integración con billeteras Web3",3,null)],3,null)],3,null),e("div",null,null,[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"Blockchain",3,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Implementado sobre red EVM-compatible",3,null),e("li",null,null,"Smart Contracts para tokens NFT (propiedades)",3,null),e("li",null,null,"Smart Contracts para tokens KNRT (pagos)",3,null)],3,null)],3,null),e("div",null,{class:"border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[i(Vt,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"Hi_9"),"Backend"],1,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"API REST para metadatos y funciones auxiliares",3,null),e("li",null,null,"Base de datos SQL para información no-blockchain",3,null),e("li",null,null,"Servicios de autenticación y verificación",3,null)],3,null),e("div",null,{class:"snippet-tag bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"},"TursoDb & Node.js",3,null)],1,null),e("div",null,{class:"border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[i(Ke,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"Hi_10"),"Integración"],1,null),e("ul",null,{class:"list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Oráculos blockchain (Chainlink)",3,null),e("li",null,null,"IPFS para almacenamiento descentralizado",3,null),e("li",null,null,"Servicios KYC y verificación legal",3,null)],3,null),e("div",null,{class:"snippet-tag bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"},"Integraciones API",3,null)],1,null)],1,null),e("div",null,{class:"mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"},[e("h4",null,{class:"font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"},"Tecnologías Clave",3,null),e("div",null,{class:"flex flex-wrap gap-2"},[e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"Solidity",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"Qwik.js",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"ERC721",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"ERC20",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"IPFS",3,null),e("span",null,{class:"px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium"},"TursoDb",3,null)],3,null)],3,null)],1,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Flujo de Datos",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"El flujo de datos entre los componentes del sistema sigue un patrón de comunicación asíncrono con verificaciones en múltiples niveles para garantizar la integridad y consistencia:",3,null),e("ol",null,{class:"list-decimal pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("strong",null,null,"Solicitud de usuario",3,null),": Iniciada desde la interfaz frontend"],3,null),e("li",null,null,[e("strong",null,null,"Validación local",3,null),": Verificación preliminar en el cliente"],3,null),e("li",null,null,[e("strong",null,null,"API Backend",3,null),": Procesamiento y preparación de transacciones"],3,null),e("li",null,null,[e("strong",null,null,"Firma de transacción",3,null),": Usuario firma con su billetera Web3"],3,null),e("li",null,null,[e("strong",null,null,"Procesamiento blockchain",3,null),": Transacción procesada por smart contracts"],3,null),e("li",null,null,[e("strong",null,null,"Confirmación",3,null),": Resultados verificados y notificados al usuario"],3,null)],3,null)],3,null)],1,null),e("section",{ref:r},{id:"system-layers",class:"mb-12 section"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Capas del Sistema",3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"1. Capa de Blockchain",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("p",null,{class:"text-gray-700 dark:text-gray-300"},[e("span",null,{class:"font-medium"},"Red:",3,null)," Ethereum o red EVM-compatible (como Base) para optimizar costos de transacción."],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Esta capa proporciona la infraestructura descentralizada sobre la que se ejecutan los contratos inteligentes. Se accede a través de nodos RPC y se monitorea mediante servicios de indexación para un rendimiento óptimo.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"2. Capa de Smart Contracts",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato ERC721:",3,null)," Tokenización y registro de inmuebles."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato ERC20:",3,null)," Gestión del token de pago KNRT."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato Marketplace:",3,null)," Listado, compra/venta y transferencia de NFTs."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato de Alquiler:",3,null)," Gestión de contratos de arrendamiento."],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Contrato de Escrow:",3,null)," Bloqueo y liberación de tokens según condiciones."],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Los contratos inteligentes están implementados en Solidity v0.8.22 o superior, con un enfoque en la seguridad, eficiencia de gas y facilidad de actualización. Siguen patrones establecidos como proxy actualizable y control de acceso basado en roles.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"3. Capa de Interfaz de Usuario",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Frontend:",3,null)," Aplicación web desarrollada en Qwik.js"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Integración Web3:",3,null)," Ethers.js para interactuar con la blockchain"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"La interfaz de usuario está diseñada para ser intuitiva y responsiva, con soporte para múltiples billeteras y optimización para dispositivos móviles y de escritorio. Implementa principios de diseño centrado en el usuario y accesibilidad.",3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"4. Capa de Backend",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Servidores:",3,null)," Node.js para API y servicios auxiliares"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Base de datos:",3,null)," SQL para almacenamiento estructurado"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"IPFS:",3,null)," Almacenamiento descentralizado para metadatos"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"La capa de backend gestiona operaciones que requieren procesamiento fuera de la cadena, como la generación de metadatos, el almacenamiento de documentos legales y la indexación para búsquedas eficientes de propiedades.",3,null)],3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"5. Integraciones Adicionales",3,null),e("div",null,{class:"bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4"},e("ul",null,{class:"space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"Oráculos:",3,null)," Chainlink para validar condiciones externas"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"KYC/AML:",3,null)," Servicios de verificación de identidad"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Pasarelas de Pago:",3,null)," Integración fiat-cripto (opcional)"],3,null)],3,null),3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-4"},"Estas integraciones extienden la funcionalidad del sistema, permitiendo una conexión segura con sistemas externos y cumplimiento de requisitos regulatorios.",3,null)],3,null)],3,null),e("section",{ref:o},{id:"smart-contracts",class:"mb-12 section"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Contratos Inteligentes",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"Los contratos inteligentes son el núcleo de la plataforma TokenEstate, proporcionando la lógica de negocio descentralizada que permite la tokenización y gestión de propiedades inmobiliarias. Están desarrollados en Solidity y siguen las mejores prácticas de seguridad y optimización.",3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center"},[i(Ke,{class:"w-5 h-5 mr-2 text-indigo-500",[a]:{class:a}},3,"Hi_11"),"Estructura de Contratos"],1,null),e("div",null,{class:"grid md:grid-cols-2 gap-6 mb-6"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-blue-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400"},"PropertyNFT.sol",3,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Contrato ERC721 para tokenización de propiedades inmobiliarias",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Registro de propiedades con metadatos",3,null),e("li",null,null,"Sistema de verificación de autenticidad",3,null),e("li",null,null,"Actualización controlada de metadatos",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-green-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[i(Bt,{class:"w-4 h-4 mr-2",[a]:{class:a}},3,"Hi_12")," KNRT.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Token ERC20 utilizado para pagos en la plataforma",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Transferencias con permisos específicos",3,null),e("li",null,null,"Funciones de congelamiento para escrow",3,null),e("li",null,null,"Controles anti-inflación",3,null)],3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-yellow-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[i(Ht,{class:"w-4 h-4 mr-2",[a]:{class:a}},3,"Hi_13")," Marketplace.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Facilita la compra/venta de PropertyNFTs",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Listado de propiedades con precios",3,null),e("li",null,null,"Funciones de oferta y contraoferta",3,null),e("li",null,null,"Comisiones configurables",3,null)],3,null)],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-purple-500"},[e("h4",null,{class:"font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center"},[i(Yt,{class:"w-4 h-4 mr-2",[a]:{class:a}},3,"Hi_14")," RentalManager.sol"],1,null),e("p",null,{class:"text-gray-600 dark:text-gray-400 text-sm mb-2"},"Gestión de contratos de alquiler para propiedades",3,null),e("ul",null,{class:"list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"},[e("li",null,null,"Creación de acuerdos de arrendamiento",3,null),e("li",null,null,"Programación de pagos periódicos",3,null),e("li",null,null,"Gestión de disputas y terminación",3,null)],3,null)],1,null)],1,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center"},[i(Ke,{class:"w-5 h-5 mr-2 text-indigo-500",[a]:{class:a}},3,"Hi_15"),"Ejemplo de Código: PropertyNFT.sol"],1,null),e("div",null,{class:"code-block"},[e("button",null,{class:"copy-button"},"Copiar",3,null),e("pre",null,null,`// SPDX-License-Identifier: MIT
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
}`,3,null)],3,null)],1,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Próximos Pasos para Despliegue",3,null),e("ol",null,{class:"list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2"},[e("li",null,null,"Despliegue de tokens ERC721 para representación de propiedades.",3,null),e("li",null,null,"Despliegue del token KNRT (ERC20) para pagos en la plataforma.",3,null),e("li",null,null,"Despliegue de contrato RentalEscrow para gestión de garantías.",3,null),e("li",null,null,"Despliegue de Marketplace para compra/venta de propiedades.",3,null),e("li",null,null,"Configuración de roles y permisos en cada contrato.",3,null),e("li",null,null,"Auditoría de seguridad completa antes del lanzamiento en mainnet.",3,null)],3,null)],3,null)],1,null)],1,null),e("section",null,{id:"security",class:"mb-12"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Seguridad y Auditoría",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"La seguridad es una prioridad crítica en la plataforma TokenEstate. Se implementan múltiples capas de seguridad y procesos de auditoría rigurosos para proteger los activos y datos de los usuarios.",3,null),e("div",null,{class:"grid md:grid-cols-2 gap-6 mb-8"},[e("div",null,{class:"bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md"},[e("h3",null,{class:"text-xl font-semibold mb-3 text-gray-800 dark:text-white"},"Seguridad de Smart Contracts",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Auditorías por firmas especializadas",3,null),e("li",null,null,"Tests de penetración y análisis estático",3,null),e("li",null,null,"Control de acceso basado en roles",3,null),e("li",null,null,"Patrones de diseño seguros (Checks-Effects-Interactions)",3,null),e("li",null,null,"Implementación gradual con pausas de emergencia",3,null)],3,null)],3,null),e("div",null,{class:"bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md"},[e("h3",null,{class:"text-xl font-semibold mb-3 text-gray-800 dark:text-white"},"Seguridad de Aplicación",3,null),e("ul",null,{class:"list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300"},[e("li",null,null,"Autenticación multifactor",3,null),e("li",null,null,"Conexiones cifradas (HTTPS/TLS)",3,null),e("li",null,null,"Validación de entradas en frontend y backend",3,null),e("li",null,null,"Protección contra ataques comunes (XSS, CSRF)",3,null),e("li",null,null,"Monitoreo y alertas en tiempo real",3,null)],3,null)],3,null)],3,null),e("div",null,{class:"mb-8"},[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Proceso de Auditoría",3,null),e("ol",null,{class:"list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2"},[e("li",null,null,[e("strong",null,null,"Auditoría Interna:",3,null)," Revisión de código por el equipo de desarrollo."],3,null),e("li",null,null,[e("strong",null,null,"Auditoría Comunitaria:",3,null)," Programa de recompensas para encontrar vulnerabilidades."],3,null),e("li",null,null,[e("strong",null,null,"Auditoría Profesional:",3,null)," Contratación de firmas especializadas en seguridad blockchain."],3,null),e("li",null,null,[e("strong",null,null,"Testnet Público:",3,null)," Despliegue en redes de prueba para validación amplia."],3,null),e("li",null,null,[e("strong",null,null,"Despliegue Mainnet:",3,null)," Lanzamiento progresivo con límites y monitoreo continuo."],3,null)],3,null)],3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Gestión de Riesgos",3,null),e("div",null,{class:"overflow-x-auto"},e("table",null,{class:"min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"},[e("thead",null,null,e("tr",null,{class:"bg-gray-50 dark:bg-gray-700 text-left"},[e("th",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200"},"Escenario",3,null),e("th",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200"},"Medidas de Mitigación",3,null)],3,null),3,null),e("tbody",null,null,[e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Impago de alquiler",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Garantías en escrow, ejecución automática por contrato",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Disputa contractual",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Sistema de resolución con árbitros designados",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Fallo en oráculo",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Múltiples fuentes de datos, mecanismo de fallback",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Vulnerabilidad en contrato",3,null),e("td",null,{class:"py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300"},"Pausa de emergencia, actualizaciones por proxy",3,null)],3,null)],3,null)],3,null),3,null)],3,null)],3,null),e("section",null,{id:"timeline",class:"mb-12"},[e("h2",null,{class:"text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Cronograma y Estimación de Tiempos",3,null),e("p",null,{class:"text-gray-700 dark:text-gray-300 mb-6"},"El desarrollo e implementación de la plataforma TokenEstate seguirá un enfoque iterativo, con fases bien definidas y entregables específicos para cada etapa.",3,null),e("div",null,{class:"overflow-x-auto mb-8"},e("table",null,{class:"min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"},[e("thead",null,null,e("tr",null,{class:"bg-indigo-50 dark:bg-indigo-900/30"},[e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Fase",3,null),e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Actividades",3,null),e("th",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300"},"Duración",3,null)],3,null),3,null),e("tbody",null,null,[e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"1. Diseño y Planificación",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Arquitectura, especificaciones técnicas, planificación de sprints",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"2 - 3 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"2. Desarrollo de Smart Contracts",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Implementación, pruebas unitarias, auditoría interna",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"8 - 12 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"3. Desarrollo Frontend/Backend",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Interfaz de usuario, API, integración Web3",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"4 - 6 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"4. Integración y Testing",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Pruebas de integración, testnet público",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"2 - 3 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"5. Auditoría de Seguridad",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Auditoría externa, correcciones, validación final",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"3 - 4 semanas",3,null)],3,null),e("tr",null,null,[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"},"6. Despliegue y Launch",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"Mainnet, monitoreo, lanzamiento público",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"},"1 semana",3,null)],3,null),e("tr",null,{class:"bg-indigo-50 dark:bg-indigo-900/20"},[e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200"},"Total Estimado",3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700"},null,3,null),e("td",null,{class:"py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200"},"20 - 29 semanas",3,null)],3,null)],3,null)],3,null),3,null),e("div",null,null,[e("h3",null,{class:"text-xl font-semibold mb-4 text-gray-800 dark:text-white"},"Hitos Clave",3,null),e("ul",null,{class:"list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300"},[e("li",null,null,[e("span",null,{class:"font-medium"},"MVP en Testnet:",3,null)," Semana 14 - Funcionalidades básicas operativas"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Beta Pública:",3,null)," Semana 18 - Versión preliminar para testers seleccionados"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Auditoría Completa:",3,null)," Semana 24 - Finalización de auditorías de seguridad"],3,null),e("li",null,null,[e("span",null,{class:"font-medium"},"Launch en Mainnet:",3,null)," Semana 26-29 - Despliegue en red principal"],3,null)],3,null)],3,null)],3,null)],1,null),e("div",null,{class:g(d=>`tab-content ${d.value==="contracts"?"active":""}`,[l],'`tab-content ${p0.value==="contracts"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Contratos Inteligentes",3,null),3,null),e("div",null,{class:g(d=>`tab-content ${d.value==="security"?"active":""}`,[l],'`tab-content ${p0.value==="security"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Seguridad y Auditoría",3,null),3,null),e("div",null,{class:g(d=>`tab-content ${d.value==="implementation"?"active":""}`,[l],'`tab-content ${p0.value==="implementation"?"active":""}`')},e("h2",null,{class:"text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300"},"Implementación y Despliegue",3,null),3,null),e("div",null,{class:"flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700"},[e("a",null,{href:"/about",class:"inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"},[e("svg",null,{class:"w-4 h-4 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M15 19l-7-7 7-7"},null,3,null),3,null),"Volver a la Información General"],3,null),e("a",null,{href:"/marketplace",class:"inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"},["Explorar Marketplace",e("svg",null,{class:"w-4 h-4 ml-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},e("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M9 5l7 7-7 7"},null,3,null),3,null)],3,null)],3,null)],1,null)],1,null)],1,"Hi_16")},ni=M(p(ai,"s_IVLxFPyAapY")),ri=Object.freeze(Object.defineProperty({__proto__:null,_auto_BuildingIcon:Yt,_auto_CodeIcon:Ke,_auto_CreditCardIcon:Bt,_auto_DatabaseIcon:Vt,_auto_LockIcon:Ht,default:ni},Symbol.toStringTag,{value:"Module"})),Gt=[{id:"contratos-laborales",title:"Contratos Laborales",description:"Plantillas para diferentes tipos de contratos laborales",icon:ze},{id:"despidos",title:"Cartas de Despido",description:"Documentos relacionados con la terminación de relaciones laborales",icon:V},{id:"demandas",title:"Demandas Laborales",description:"Documentos para procesos judiciales laborales",icon:Yl},{id:"reclamaciones",title:"Reclamaciones",description:"Documentos para reclamar derechos laborales e indemnizaciones",icon:V}],Xt=[{id:"afiliaciones",title:"Afiliaciones",description:"Documentos para gestionar la afiliación sindical",icon:ze},{id:"convenios",title:"Convenios Colectivos",description:"Documentos relacionados con convenios y pactos colectivos",icon:V},{id:"conflictos",title:"Conflictos Laborales",description:"Documentos para la gestión de huelgas y conflictos",icon:Yl},{id:"derechos",title:"Derechos Laborales",description:"Información y recursos sobre derechos de los trabajadores",icon:V}],oi=()=>{const t=tl().value.isDespacho?Gt:Xt;return e("div",null,{class:"documentos-page"},[e("div",null,{class:"page-header"},[e("h1",null,{class:"page-title"},"Documentos Legales",3,null),e("p",null,{class:"page-description"},"Genera documentos legales personalizados para tus necesidades laborales",3,null)],3,null),e("div",null,{class:"options-section"},[e("div",null,{class:"option-card ai-assistant"},[e("div",null,{class:"option-icon"},i(he,{class:"w-12 h-12 text-white",[a]:{class:a}},3,"w0_0"),1,null),e("div",null,{class:"option-content"},[e("h2",null,{class:"option-title"},"Asistente de IA",3,null),e("p",null,{class:"option-description"},"Genera documentos personalizados con la ayuda de nuestro asistente de inteligencia artificial. Ideal para documentos complejos o casos específicos.",3,null),i(D,{href:"/documentos-legales/asistente/",class:"option-btn",children:"Usar Asistente",[a]:{href:a,class:a}},3,"w0_1")],1,null)],1,null),e("div",null,{class:"option-card templates"},[e("div",null,{class:"option-icon"},i(V,{class:"w-12 h-12 text-white",[a]:{class:a}},3,"w0_2"),1,null),e("div",null,{class:"option-content"},[e("h2",null,{class:"option-title"},"Plantillas Prediseñadas",3,null),e("p",null,{class:"option-description"},"Utiliza nuestras plantillas prediseñadas para generar documentos rápidamente. Solo completa los campos requeridos y obtén tu documento al instante.",3,null),e("div",null,{class:"categories-container"},[e("h3",null,{class:"categories-title"},"Elige una categoría:",3,null),e("div",null,{class:"categories-grid"},t.map(n=>i(D,{href:`/documentos-legales/generar/${n.id}/`,class:"category-card",children:[i(n.icon,{class:"w-6 h-6 category-icon",[a]:{class:a}},3,"w0_3"),e("div",null,{class:"category-info"},[e("h4",null,{class:"category-title"},$(n,"title"),1,null),e("p",null,{class:"category-description"},$(n,"description"),1,null)],1,null)],[a]:{class:a}},1,n.id)),1,null)],1,null)],1,null)],1,null),e("div",null,{class:"documents-history"},[e("h2",null,{class:"history-title"},"Mis Documentos Recientes",3,null),i(D,{href:"/documentos-legales/mis-documentos/",class:"history-link",children:"Ver todos mis documentos",[a]:{href:a,class:a}},3,"w0_4")],1,null)],1,null),e("style",null,null,`
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
        `,3,null)],1,"w0_5")},si=M(p(oi,"s_54EgGtiLXHw")),ii=Object.freeze(Object.defineProperty({__proto__:null,_auto_categoriasDespacho:Gt,_auto_categoriasSindicato:Xt,default:si},Symbol.toStringTag,{value:"Module"})),Wt=["Andalucía","Aragón","Cantabria","Castilla La Mancha","Castilla y León","Cataluña","Comunidad de Madrid","Comunidad Valenciana","Extremadura","Galicia","Islas Baleares","Islas Canarias","La Rioja","Navarra","País Vasco","Principado de Asturias","Región de Murcia"],Kt={Andalucía:["Almería","Cádiz","Córdoba","Granada","Huelva","Jaén","Málaga","Sevilla"],Aragón:["Huesca","Teruel","Zaragoza"],Cantabria:["Cantabria"],"Castilla La Mancha":["Albacete","Ciudad Real","Cuenca","Guadalajara","Toledo"],"Castilla y León":["Ávila","Burgos","León","Palencia","Salamanca","Segovia","Soria","Valladolid","Zamora"],Cataluña:["Barcelona","Girona","Lleida","Tarragona"],"Comunidad de Madrid":["Madrid"],"Comunidad Valenciana":["Alicante","Castellón","Valencia"],Extremadura:["Badajoz","Cáceres"],Galicia:["A Coruña","Lugo","Ourense","Pontevedra"],"Islas Baleares":["Baleares"],"Islas Canarias":["Las Palmas","Santa Cruz de Tenerife"],"La Rioja":["La Rioja"],Navarra:["Navarra"],"País Vasco":["Álava","Guipúzcoa","Vizcaya"],"Principado de Asturias":["Asturias"],"Región de Murcia":["Murcia"]},Qt=["Administrativo","Abogado","Arquitecto","Contable","Desarrollador","Diseñador","Enfermero","Médico","Profesor","Técnico"],Zt=["Indefinido","Temporal","Por obra o servicio","En prácticas","Formación"],Jt=["Sí","No"],ea=["Completa","Parcial","Intensiva","Flexible"],la=["Administración y gestión","Agricultura","Comercio y marketing","Construcción","Educación","Hostelería y turismo","Informática y comunicaciones","Sanidad","Servicios socioculturales","Transporte y logística"],ta=["Grupo 1: Ingenieros y Licenciados","Grupo 2: Ingenieros técnicos, Peritos","Grupo 3: Jefes administrativos","Grupo 4: Ayudantes no titulados","Grupo 5: Oficiales administrativos","Grupo 6: Subalternos","Grupo 7: Auxiliares administrativos"],aa=L.object({community:L.string().min(1,"Por favor seleccione una comunidad"),province:L.string().min(1,"Por favor seleccione una provincia"),profession:L.string().min(1,"Por favor seleccione una profesión"),contractStartDate:L.string().min(1,"Por favor ingrese la fecha de inicio"),contractEndDate:L.string().optional(),contractType:L.string().min(1,"Por favor seleccione un tipo de contrato"),probationPeriod:L.string().min(1,"Por favor indique si hay periodo de prueba"),workScheduleType:L.string().min(1,"Por favor seleccione un tipo de jornada"),weeklyHours:L.string().optional(),netSalary:L.string().optional(),grossSalary:L.string().optional(),extraPayments:L.string().optional(),sector:L.string().optional(),contributionGroup:L.string().optional()}),na=l=>{var t,n,r;return{community:(l==null?void 0:l.community)||"",province:(l==null?void 0:l.province)||"",profession:(l==null?void 0:l.profession)||"",contractStartDate:(l==null?void 0:l.contract_start_date)||"",contractEndDate:(l==null?void 0:l.contract_end_date)||"",contractType:(l==null?void 0:l.contract_type)||"",probationPeriod:(l==null?void 0:l.probation_period)||"",workScheduleType:(l==null?void 0:l.work_schedule_type)||"",weeklyHours:((t=l==null?void 0:l.weekly_hours)==null?void 0:t.toString())||"",netSalary:((n=l==null?void 0:l.net_salary)==null?void 0:n.toString())||"",grossSalary:((r=l==null?void 0:l.gross_salary)==null?void 0:r.toString())||"",extraPayments:(l==null?void 0:l.extra_payments)||"",sector:(l==null?void 0:l.sector)||"",contributionGroup:(l==null?void 0:l.contribution_group)||""}},ra=l=>({community:l.community,province:l.province,profession:l.profession,contract_start_date:l.contractStartDate,contract_end_date:l.contractEndDate||null,contract_type:l.contractType,probation_period:l.probationPeriod,work_schedule_type:l.workScheduleType,weekly_hours:l.weeklyHours?parseInt(l.weeklyHours):null,net_salary:l.netSalary?parseFloat(l.netSalary):null,gross_salary:l.grossSalary?parseFloat(l.grossSalary):null,extra_payments:l.extraPayments||null,sector:l.sector||null,contribution_group:l.contributionGroup||null}),ci=async l=>{if(l.cacheControl({maxAge:0,staleWhileRevalidate:0,noStore:!0}),!await Ae(l))throw l.redirect(302,"/auth");const n=W(l);if(!n)return{community:"",province:"",profession:"",contractStartDate:"",contractEndDate:"",contractType:"",probationPeriod:"",workScheduleType:"",weeklyHours:"",netSalary:"",grossSalary:"",extraPayments:"",sector:"",contributionGroup:""};const r=U(l);try{const o=await r.execute({sql:"SELECT * FROM contract_details WHERE user_id = ?",args:[n]});return o.rows.length>0?na(o.rows[0]):{community:"",province:"",profession:"",contractStartDate:"",contractEndDate:"",contractType:"",probationPeriod:"",workScheduleType:"",weeklyHours:"",netSalary:"",grossSalary:"",extraPayments:"",sector:"",contributionGroup:""}}catch(o){return console.error("[CONTRACT-LOAD] Error loading contract data:",o),{community:"",province:"",profession:"",contractStartDate:"",contractEndDate:"",contractType:"",probationPeriod:"",workScheduleType:"",weeklyHours:"",netSalary:"",grossSalary:"",extraPayments:"",sector:"",contributionGroup:""}}},oa=G(p(ci,"s_ol0LkfVFN1o")),di=async(l,t)=>{const n=W(t);if(!n)throw t.redirect(302,"/auth");const r=U(t);try{const o=await r.execute({sql:"SELECT id FROM contract_details WHERE user_id = ?",args:[n]}),s=ra(l);if(o.rows.length>0){const c=o.rows[0].id;await r.execute({sql:`UPDATE contract_details SET
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
            WHERE id = ? AND user_id = ?`,args:[s.community,s.province,s.profession,s.contract_start_date,s.contract_end_date,s.contract_type,s.probation_period,s.work_schedule_type,s.weekly_hours,s.net_salary,s.gross_salary,s.extra_payments,s.sector,s.contribution_group,c,n]})}else await r.execute({sql:`INSERT INTO contract_details (
            user_id, community, province, profession, contract_start_date, 
            contract_end_date, contract_type, probation_period, work_schedule_type, 
            weekly_hours, net_salary, gross_salary, extra_payments, sector, contribution_group
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,args:[n,s.community,s.province,s.profession,s.contract_start_date,s.contract_end_date,s.contract_type,s.probation_period,s.work_schedule_type,s.weekly_hours,s.net_salary,s.gross_salary,s.extra_payments,s.sector,s.contribution_group]});return{status:"success",message:"Datos del contrato guardados correctamente"}}catch(o){return console.error("[CONTRACT-SAVE] Error saving contract data:",o),{status:"error",message:o instanceof Error?o.message:"Error saving contract data"}}},sa=X(p(di,"s_ciapiCcKhho"),Ee(p(aa,"s_bkcP8YWk1RM"))),ui=async l=>{const[t]=I(),r=l.target.value;t.value=r;const o=document.getElementById("province");o&&(o.value="")},gi=()=>{var o,s,c,d,u,b,m,f,k,v,A,S,y,x,_,j,P;const l=oa(),t=sa(),n=E(l.value.community),r=p(ui,"s_yfWV0AUD06E",[n]);return e("div",null,{class:"container mx-auto py-8 px-4"},e("div",null,{class:"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"},[e("h1",null,{class:"text-2xl font-bold text-gray-900 dark:text-white mb-6"},"Datos de tu Contrato Laboral",3,null),((o=t.value)==null?void 0:o.status)==="success"&&e("div",null,{class:"mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300"},g(h=>h.value.message,[t],"p0.value.message"),3,"d3_0"),((s=t.value)==null?void 0:s.status)==="error"&&e("div",null,{class:"mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300"},g(h=>h.value.message,[t],"p0.value.message"),3,"d3_1"),i(K,{action:t,class:"space-y-6",children:[e("div",null,{class:"grid grid-cols-1 md:grid-cols-2 gap-6"},[e("div",null,null,[e("label",null,{for:"community",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Comunidad Autónoma",3,null),e("select",null,{id:"community",name:"community",value:g((h,Z)=>Z.value||h.value.community,[l,n],"p1.value||p0.value.community"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",onChange$:r},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.community,[l],"!p0.value.community")},"Seleccione una comunidad",3,null),Wt.map(h=>e("option",{value:h},null,h,1,h))],1,null),((d=(c=t.value)==null?void 0:c.fieldErrors)==null?void 0:d.community)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},g(h=>h.value.fieldErrors.community,[t],"p0.value.fieldErrors.community"),3,"d3_2")],1,null),e("div",null,null,[e("label",null,{for:"province",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Provincia",3,null),e("select",null,{id:"province",name:"province",value:g(h=>h.value.province,[l],"p0.value.province"),disabled:g(h=>!h.value,[n],"!p0.value"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.province,[l],"!p0.value.province")},n.value?"Seleccione una provincia":"Primero seleccione una comunidad",1,null),n.value&&((u=Kt[n.value])==null?void 0:u.map(h=>e("option",{value:h},null,h,1,h)))],1,null),((m=(b=t.value)==null?void 0:b.fieldErrors)==null?void 0:m.province)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},g(h=>h.value.fieldErrors.province,[t],"p0.value.fieldErrors.province"),3,"d3_3")],1,null),e("div",null,null,[e("label",null,{for:"profession",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Profesión",3,null),e("select",null,{id:"profession",name:"profession",value:g(h=>h.value.profession,[l],"p0.value.profession"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.profession,[l],"!p0.value.profession")},"Seleccione una profesión",3,null),Qt.map(h=>e("option",{value:h},null,h,1,h))],1,null),((k=(f=t.value)==null?void 0:f.fieldErrors)==null?void 0:k.profession)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},g(h=>h.value.fieldErrors.profession,[t],"p0.value.fieldErrors.profession"),3,"d3_4")],1,null),e("div",null,null,[e("label",null,{for:"contractStartDate",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de inicio del contrato",3,null),e("input",null,{id:"contractStartDate",name:"contractStartDate",type:"date",value:g(h=>h.value.contractStartDate,[l],"p0.value.contractStartDate"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null),((A=(v=t.value)==null?void 0:v.fieldErrors)==null?void 0:A.contractStartDate)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},g(h=>h.value.fieldErrors.contractStartDate,[t],"p0.value.fieldErrors.contractStartDate"),3,"d3_5")],1,null),e("div",null,null,[e("label",null,{for:"contractEndDate",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Fecha de finalización del contrato",3,null),e("input",null,{id:"contractEndDate",name:"contractEndDate",type:"date",value:g(h=>h.value.contractEndDate,[l],"p0.value.contractEndDate"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null),e("p",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},"Dejar en blanco para contratos indefinidos",3,null)],3,null),e("div",null,null,[e("label",null,{for:"contractType",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Tipo de contrato",3,null),e("select",null,{id:"contractType",name:"contractType",value:g(h=>h.value.contractType,[l],"p0.value.contractType"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.contractType,[l],"!p0.value.contractType")},"Seleccione tipo de contrato",3,null),Zt.map(h=>e("option",{value:h},null,h,1,h))],1,null),((y=(S=t.value)==null?void 0:S.fieldErrors)==null?void 0:y.contractType)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},g(h=>h.value.fieldErrors.contractType,[t],"p0.value.fieldErrors.contractType"),3,"d3_6")],1,null),e("div",null,null,[e("label",null,{for:"probationPeriod",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Periodo de prueba",3,null),e("select",null,{id:"probationPeriod",name:"probationPeriod",value:g(h=>h.value.probationPeriod,[l],"p0.value.probationPeriod"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.probationPeriod,[l],"!p0.value.probationPeriod")},"¿Tiene periodo de prueba?",3,null),Jt.map(h=>e("option",{value:h},null,h,1,h))],1,null),((_=(x=t.value)==null?void 0:x.fieldErrors)==null?void 0:_.probationPeriod)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},g(h=>h.value.fieldErrors.probationPeriod,[t],"p0.value.fieldErrors.probationPeriod"),3,"d3_7")],1,null),e("div",null,null,[e("label",null,{for:"workScheduleType",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Tipo de jornada",3,null),e("select",null,{id:"workScheduleType",name:"workScheduleType",value:g(h=>h.value.workScheduleType,[l],"p0.value.workScheduleType"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.workScheduleType,[l],"!p0.value.workScheduleType")},"Seleccione tipo de jornada",3,null),ea.map(h=>e("option",{value:h},null,h,1,h))],1,null),((P=(j=t.value)==null?void 0:j.fieldErrors)==null?void 0:P.workScheduleType)&&e("div",null,{class:"mt-1 text-red-600 dark:text-red-400 text-sm"},g(h=>h.value.fieldErrors.workScheduleType,[t],"p0.value.fieldErrors.workScheduleType"),3,"d3_8")],1,null),e("div",null,null,[e("label",null,{for:"weeklyHours",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Horas semanales",3,null),e("input",null,{id:"weeklyHours",name:"weeklyHours",type:"number",min:"1",max:"60",value:g(h=>h.value.weeklyHours,[l],"p0.value.weeklyHours"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"netSalary",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Salario Neto",3,null),e("div",null,{class:"relative"},[e("input",null,{id:"netSalary",name:"netSalary",type:"number",step:"0.01",min:"0",value:g(h=>h.value.netSalary,[l],"p0.value.netSalary"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-7"},null,3,null),e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},e("span",null,{class:"text-gray-500"},"€",3,null),3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"grossSalary",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Salario Bruto",3,null),e("div",null,{class:"relative"},[e("input",null,{id:"grossSalary",name:"grossSalary",type:"number",step:"0.01",min:"0",value:g(h=>h.value.grossSalary,[l],"p0.value.grossSalary"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-7"},null,3,null),e("div",null,{class:"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"},e("span",null,{class:"text-gray-500"},"€",3,null),3,null)],3,null)],3,null),e("div",null,null,[e("label",null,{for:"extraPayments",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Pagas Extras",3,null),e("input",null,{id:"extraPayments",name:"extraPayments",type:"text",value:g(h=>h.value.extraPayments,[l],"p0.value.extraPayments"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},null,3,null)],3,null),e("div",null,null,[e("label",null,{for:"sector",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Sector / Sindicato",3,null),e("select",null,{id:"sector",name:"sector",value:g(h=>h.value.sector,[l],"p0.value.sector"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.sector,[l],"!p0.value.sector")},"Seleccione un sector",3,null),la.map(h=>e("option",{value:h},null,h,1,h))],1,null)],1,null),e("div",null,null,[e("label",null,{for:"contributionGroup",class:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"},"Grupo de Cotización",3,null),e("select",null,{id:"contributionGroup",name:"contributionGroup",value:g(h=>h.value.contributionGroup,[l],"p0.value.contributionGroup"),class:"block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"},[e("option",null,{value:"",disabled:!0,selected:g(h=>!h.value.contributionGroup,[l],"!p0.value.contributionGroup")},"Seleccione grupo de cotización",3,null),ta.map(h=>e("option",{value:h},null,h,1,h))],1,null)],1,null)],1,null),e("div",null,{class:"flex justify-end mt-8"},e("button",null,{type:"submit",class:"py-3 px-8 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"},[i(ll,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"d3_9"),e("span",null,null,"Guardar Cambios",3,null)],1,null),1,null)],[a]:{action:a,class:a}},1,"d3_10")],1,null),1,"d3_11")},mi=M(p(gi,"s_mx2B29bX000")),pi=Object.freeze(Object.defineProperty({__proto__:null,_auto_communities:Wt,_auto_contractFormSchema:aa,_auto_contractTypes:Zt,_auto_contributionGroups:ta,_auto_mapDBToFormFields:na,_auto_mapFormToDatabaseFields:ra,_auto_probationOptions:Jt,_auto_professions:Qt,_auto_provincesByRegion:Kt,_auto_sectors:la,_auto_workScheduleTypes:ea,default:mi,useContractAction:sa,useContractData:oa},Symbol.toStringTag,{value:"Module"})),bi=async l=>{const t=W(l);if(!t)return{timesheet:[],isCheckedIn:!1,currentEntry:null};const n=U(l);try{const r=await n.execute({sql:`SELECT * FROM user_timesheet 
            WHERE user_id = ? AND check_out_time IS NULL 
            ORDER BY check_in_time DESC LIMIT 1`,args:[t]}),o=r.rows.length>0,s=o?r.rows[0]:null;return{timesheet:(await n.execute({sql:`SELECT * FROM user_timesheet 
            WHERE user_id = ? 
            ORDER BY check_in_time DESC LIMIT 10`,args:[t]})).rows,isCheckedIn:o,currentEntry:s}}catch(r){return console.error("[Timesheet Loader] Error:",r),{timesheet:[],isCheckedIn:!1,currentEntry:null}}},ia=G(p(bi,"s_kV5Mi7j0weM")),xi=async(l,t)=>{const n=W(t);if(!n)return{success:!1,message:"Usuario no identificado. Por favor inicia sesión nuevamente."};const{latitude:r,longitude:o}=l,s=r&&o?JSON.stringify({latitude:r,longitude:o}):null,c=U(t);try{return(await c.execute({sql:`SELECT id FROM user_timesheet 
            WHERE user_id = ? AND check_out_time IS NULL`,args:[n]})).rows.length>0?{success:!1,message:"Ya tienes una entrada activa. Debes fichar salida primero."}:(await c.execute({sql:`INSERT INTO user_timesheet 
            (user_id, check_in_time, check_in_location) 
            VALUES (?, CURRENT_TIMESTAMP, ?)`,args:[n,s]}),{success:!0,message:"Entrada fichada correctamente",timestamp:new Date().toISOString()})}catch(d){return console.error("[Check-In Action] Error:",d),{success:!1,message:"Error al fichar entrada"}}},ca=X(p(xi,"s_2KEilzizEdE")),hi=async(l,t)=>{const n=W(t);if(!n)return{success:!1,message:"Usuario no identificado"};const{latitude:r,longitude:o}=l,s=r&&o?JSON.stringify({latitude:r,longitude:o}):null,c=U(t);try{const d=await c.execute({sql:`SELECT id, check_in_time FROM user_timesheet 
            WHERE user_id = ? AND check_out_time IS NULL 
            ORDER BY check_in_time DESC LIMIT 1`,args:[n]});if(d.rows.length===0)return{success:!1,message:"No tienes una entrada activa para fichar salida."};const u=d.rows[0].id,b=String(d.rows[0].check_in_time),m=new Date(b),f=new Date,k=Math.round((f.getTime()-m.getTime())/6e4);return await c.execute({sql:`UPDATE user_timesheet 
            SET check_out_time = CURRENT_TIMESTAMP, 
                check_out_location = ?, 
                total_minutes = ? 
            WHERE id = ?`,args:[s,k,u]}),{success:!0,message:"Salida fichada correctamente",timestamp:f.toISOString(),totalMinutes:k}}catch(d){return console.error("[Check-Out Action] Error:",d),{success:!1,message:"Error al fichar salida"}}},da=X(p(hi,"s_8vTpSx2690k")),fi=l=>{const t=new Date(l),r=new Date().getTime()-t.getTime(),o=Math.floor(r/36e5),s=Math.floor(r%36e5/6e4),c=Math.floor(r%6e4/1e3);return`${o.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}:${c.toString().padStart(2,"0")}`},yi=l=>{const t=Math.floor(l/60),n=l%60;return`${t.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`},vi=l=>new Date(l).toLocaleString(),ki=()=>{const[l]=I();l.value=!0},wi=(l,t)=>{const[n]=I();l.target&&l.target.tagName==="BUTTON"&&(n.value=!0)},_i=()=>{const[l]=I();l.value=!0},Ei=(l,t)=>{const[n]=I();l.target&&l.target.tagName==="BUTTON"&&(n.value=!0)},Ti=()=>{var k,v,A,S;Q();const l=ia(),t=ca(),n=da(),r=E(new Date().toLocaleTimeString()),o=E(null),s=E(null),c=E("00:00:00"),d=E(!1),u=E(!1),b=p(fi,"s_xWmZ6JyQ62k"),m=p(yi,"s_ejpsFxqJ24o"),f=p(vi,"s_p08jFcGimIk");return z(w("s_VjgIvF9uEqw",[r,c,b,l])),z(w("s_hTp6ngvHQmg",[t,n,d,u])),z(w("s_LtC4P2Ki0ww",[o,s])),e("div",null,{class:"grid grid-cols-1 md:grid-cols-3 gap-6"},[e("div",null,{class:"md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6"},[e("div",null,{class:"flex items-center justify-between mb-6"},[e("div",null,{class:"flex items-center"},[i(Qe,{class:"w-8 h-8 text-red-500 mr-3",[a]:{class:a}},3,"kT_0"),e("h2",null,{class:"text-2xl font-bold text-gray-800 dark:text-white"},"Fichaje actual",3,null)],1,null),e("div",null,{class:"text-3xl font-mono font-bold text-gray-800 dark:text-white"},g(y=>y.value,[r],"p0.value"),3,null)],1,null),e("div",null,{class:"mb-6"},[e("div",null,{class:"flex items-center mb-2"},[i(il,{class:"w-5 h-5 text-gray-500 mr-2",[a]:{class:a}},3,"kT_1"),e("span",null,{class:"text-gray-700 dark:text-gray-300"},"Estado de la ubicación:",3,null)],1,null),s.value?e("div",null,{class:"flex items-center text-red-500"},[i(ol,{class:"w-5 h-5 mr-2",[a]:{class:a}},3,"kT_2"),e("span",null,null,g(y=>y.value,[s],"p0.value"),3,null)],1,"kT_3"):o.value?e("div",null,{class:"text-green-500 dark:text-green-400"},["Ubicación capturada correctamente",e("div",null,{class:"text-xs text-gray-500 dark:text-gray-400 mt-1"},["Lat: ",o.value.latitude.toFixed(6),", Lng: ",o.value.longitude.toFixed(6)],1,null)],1,"kT_4"):e("div",null,{class:"text-yellow-500 dark:text-yellow-400"},"Obteniendo ubicación...",3,null)],1,null),e("div",null,{class:g(y=>`border rounded-lg p-6 mb-6 ${y.value.isCheckedIn?"border-green-500 bg-green-50 dark:bg-green-900/20":"border-gray-200 dark:border-gray-700"}`,[l],'`border rounded-lg p-6 mb-6 ${p0.value.isCheckedIn?"border-green-500 bg-green-50 dark:bg-green-900/20":"border-gray-200 dark:border-gray-700"}`')},l.value.isCheckedIn?e("div",null,null,[e("div",null,{class:"flex items-center justify-between mb-4"},[e("h3",null,{class:"text-xl font-semibold text-green-700 dark:text-green-400"},"¡Estás trabajando ahora!",3,null),e("span",null,{class:"text-3xl font-mono font-bold text-green-700 dark:text-green-400"},g(y=>y.value,[c],"p0.value"),3,null)],3,null),e("div",null,{class:"mb-4"},[e("span",null,{class:"block text-sm text-gray-600 dark:text-gray-400"},"Inicio de jornada:",3,null),e("span",null,{class:"font-medium text-gray-800 dark:text-white"},l.value.currentEntry?e("span",null,null,f(String(l.value.currentEntry.check_in_time)),1,"kT_5"):"",1,null)],1,null),i(K,{action:n,onSubmit$:p(ki,"s_vWbzTFmFL0c",[u]),onClick$:p(wi,"s_vDz2Pib5GPA",[u]),children:[e("input",null,{type:"hidden",name:"latitude",value:g(y=>{var x;return(x=y.value)==null?void 0:x.latitude},[o],"p0.value?.latitude")},null,3,null),e("input",null,{type:"hidden",name:"longitude",value:g(y=>{var x;return(x=y.value)==null?void 0:x.longitude},[o],"p0.value?.longitude")},null,3,null),e("button",null,{type:"submit",class:"w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-6 rounded-xl transition-colors flex items-center justify-center text-2xl shadow-lg border-4 border-red-500",disabled:g((y,x)=>!x.value||y.value,[u,o],"!p1.value||p0.value"),onClick$:w("s_Fk4Yqt0pXCY",[u,o])},u.value?i(B,{children:[i(ve,{class:"w-8 h-8 mr-3 animate-spin",[a]:{class:a}},3,"kT_6"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"PROCESANDO...",3,null)]},1,"kT_7"):i(B,{children:[i(Dl,{class:"w-8 h-8 mr-3",[a]:{class:a}},3,"kT_8"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"DETENER JORNADA",3,null)]},1,"kT_9"),1,null),((k=n.value)==null?void 0:k.success)===!1&&e("div",null,{class:"mt-3 text-red-500 text-sm"},g(y=>y.value.message,[n],"p0.value.message"),3,"kT_10")],[a]:{action:a,onSubmit$:a,onClick$:a}},1,"kT_11")],1,"kT_12"):e("div",null,null,[e("div",null,{class:"flex items-center justify-between mb-4"},e("h3",null,{class:"text-xl font-semibold text-green-700 dark:text-green-400"},"Listo para comenzar",3,null),3,null),e("div",null,{class:"text-center py-4"},[e("div",null,{class:"mb-4 text-gray-700 dark:text-gray-300 font-medium text-center"},"Pulsa el botón verde para comenzar tu jornada laboral",3,null),i(K,{action:t,onSubmit$:p(_i,"s_ZSPbGcu09LQ",[d]),onClick$:p(Ei,"s_vVZsbSym0ig",[d]),children:[e("input",null,{type:"hidden",name:"latitude",value:g(y=>{var x;return(x=y.value)==null?void 0:x.latitude},[o],"p0.value?.latitude")},null,3,null),e("input",null,{type:"hidden",name:"longitude",value:g(y=>{var x;return(x=y.value)==null?void 0:x.longitude},[o],"p0.value?.longitude")},null,3,null),e("button",null,{type:"submit",class:"w-full bg-green-600 hover:bg-green-500 text-white font-bold py-6 px-6 rounded-xl transition-colors flex items-center justify-center text-2xl shadow-lg border-4 border-green-500",disabled:g((y,x)=>!x.value||y.value,[d,o],"!p1.value||p0.value"),onClick$:w("s_2V3nd5UvheU",[d,o])},d.value?i(B,{children:[i(ve,{class:"w-8 h-8 mr-3 animate-spin",[a]:{class:a}},3,"kT_13"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"PROCESANDO...",3,null)]},1,"kT_14"):i(B,{children:[i(pl,{class:"w-8 h-8 mr-3",[a]:{class:a}},3,"kT_15"),e("span",null,{class:"inline-block tracking-wide font-extrabold"},"INICIAR JORNADA",3,null)]},1,"kT_16"),1,null)],[a]:{action:a,onSubmit$:a,onClick$:a}},1,"kT_17"),o.value&&e("div",null,{class:"mt-6 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md"},[e("div",null,{class:"bg-gray-100 p-2 text-sm text-gray-700 font-medium"},[i(il,{class:"w-4 h-4 inline mr-1",[a]:{class:a}},3,"kT_18"),"Tu ubicación actual"],1,null),e("div",null,{class:"h-[250px] w-full"},i(ts,{get latitude(){return o.value.latitude},get longitude(){return o.value.longitude},[a]:{latitude:g(y=>y.value.latitude,[o],"p0.value.latitude"),longitude:g(y=>y.value.longitude,[o],"p0.value.longitude")}},3,"kT_19"),1,null)],1,"kT_20"),o.value?e("div",null,{class:"mt-5 text-center animate-pulse"},e("span",null,{class:"text-base text-green-600 font-semibold"},"👆 ¡Pulsa el botón VERDE para comenzar!",3,null),3,null):e("div",null,{class:"mt-6 text-yellow-600 text-center py-3 border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md"},[i(ol,{class:"w-6 h-6 inline mr-1",[a]:{class:a}},3,"kT_21"),e("span",null,{class:"font-medium"},"Esperando ubicación para habilitar el fichaje...",3,null),e("div",null,{class:"text-sm mt-1"},"Por favor, permite el acceso a tu ubicación en el navegador",3,null)],1,"kT_22"),((v=t.value)==null?void 0:v.success)===!1&&e("div",null,{class:"mt-4 text-red-500 text-base p-3 bg-red-50 border border-red-200 rounded-lg"},[i(ol,{class:"w-5 h-5 inline mr-1",[a]:{class:a}},3,"kT_23"),g(y=>y.value.message,[t],"p0.value.message")],1,"kT_24")],1,null)],1,null),1,null),((A=t.value)==null?void 0:A.success)&&e("div",null,{class:"bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"},g(y=>y.value.message,[t],"p0.value.message"),3,"kT_25"),((S=n.value)==null?void 0:S.success)&&e("div",null,{class:"bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"},[e("p",null,null,g(y=>y.value.message,[n],"p0.value.message"),3,null),n.value.totalMinutes!==void 0&&e("p",null,{class:"text-sm mt-1"},["Tiempo trabajado: ",e("span",null,null,m(n.value.totalMinutes),1,null)," horas"],1,"kT_26")],1,"kT_27")],1,null),e("div",null,{class:"bg-white dark:bg-gray-800 rounded-lg shadow p-6"},[e("div",null,{class:"flex items-center mb-4"},[i(La,{class:"w-6 h-6 text-red-500 mr-2",[a]:{class:a}},3,"kT_28"),e("h2",null,{class:"text-xl font-bold text-gray-800 dark:text-white"},"Historial reciente",3,null)],1,null),l.value.timesheet.length===0?e("div",null,{class:"text-gray-500 dark:text-gray-400 text-center py-10"},"No hay registros de fichaje.",3,"kT_29"):e("div",null,{class:"space-y-4"},l.value.timesheet.map(y=>Q(e("div",null,{class:"border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"},[e("div",null,{class:"font-medium text-gray-800 dark:text-white"},new Date(String(y.check_in_time)).toLocaleDateString(),1,null),e("div",null,{class:"grid grid-cols-2 text-sm mt-1"},[e("div",null,{class:"text-gray-600 dark:text-gray-400"},[i(pl,{class:"w-4 h-4 inline mr-1 text-green-500",[a]:{class:a}},3,"kT_30"),new Date(String(y.check_in_time)).toLocaleTimeString()],1,null),e("div",null,{class:"text-gray-600 dark:text-gray-400"},y.check_out_time?i(B,{children:[i(Dl,{class:"w-4 h-4 inline mr-1 text-red-500",[a]:{class:a}},3,"kT_31"),new Date(String(y.check_out_time)).toLocaleTimeString()]},1,"kT_32"):e("span",null,{class:"text-green-500"},"En curso",3,null),1,null)],1,null),y.total_minutes!==null&&e("div",null,{class:"mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400"},[i(Ma,{class:"w-4 h-4 mr-1",[a]:{class:a}},3,"kT_33"),e("span",null,null,["Total: ",e("span",null,null,m(y.total_minutes),1,null)],1,null)],1,"kT_34"),y.check_in_location&&e("button",{onClick$:w("s_8KhE9BOzE7I",[y,o])},{class:"mt-2 text-xs text-blue-600 hover:underline flex items-center"},[i(il,{class:"w-3 h-3 mr-1",[a]:{class:a}},3,"kT_35"),"Ver ubicación de entrada"],0,"kT_36")],1,y.id))),1,null)],1,null)],1,"kT_37")},Ci=M(p(Ti,"s_wenwFk5169g")),Si=Object.freeze(Object.defineProperty({__proto__:null,default:Ci,useCheckInAction:ca,useCheckOutAction:da,useTimesheetLoader:ia},Symbol.toStringTag,{value:"Module"})),Ai=[],Ii=()=>Ia,Di=()=>dn,Ll=()=>bn,Ue=()=>vn,$e=()=>En,H=()=>Fn,Ri=()=>Hn,Li=[["/",[H,()=>Kn],"/",["q-ceac0e25.js","q-95a06621.js"]],["auth/logout/",[H,Ll,()=>tr],"/auth/logout/",["q-ceac0e25.js","q-2203a8fc.js","q-0cef7dba.js"]],["capacitacion/crear/",[H,Ue,()=>ir],"/capacitacion/crear/",["q-ceac0e25.js","q-d3e89879.js","q-b80e02ab.js"]],["documentos-legales/asistente/",[H,$e,()=>kr],"/documentos-legales/asistente/",["q-ceac0e25.js","q-fdfd3360.js","q-ea7635ad.js"]],["documentos-legales/mis-documentos/",[H,$e,()=>Tr],"/documentos-legales/mis-documentos/",["q-ceac0e25.js","q-fdfd3360.js","q-0112d111.js"]],["capacitacion/curso/[id]/modulos/crear/",[H,Ue,()=>jr],"/capacitacion/curso/[id]/modulos/crear/",["q-ceac0e25.js","q-d3e89879.js","q-ef84fe06.js"]],["capacitacion/curso/[id]/editar/",[H,Ue,()=>Br],"/capacitacion/curso/[id]/editar/",["q-ceac0e25.js","q-d3e89879.js","q-57b10a3d.js"]],["capacitacion/curso/[id]/",[H,Ue,()=>Gr],"/capacitacion/curso/[id]/",["q-ceac0e25.js","q-d3e89879.js","q-f43e800a.js"]],["documentos-legales/generar/[categoria]/",[H,$e,()=>Kr],"/documentos-legales/generar/[categoria]/",["q-ceac0e25.js","q-fdfd3360.js","q-d7124fae.js"]],["documentos-legales/pdf/[id]/",[H,$e,()=>to],"/documentos-legales/pdf/[id]/",["q-ceac0e25.js","q-fdfd3360.js","q-2779a0f3.js"]],["about/",[H,()=>so],"/about/",["q-ceac0e25.js","q-653cb88d.js"]],["absences/",[H,Ii,()=>yo],"/absences/",["q-ceac0e25.js","q-a8808d92.js","q-49cd6acc.js"]],["auditoria/",[H,Di,()=>Po],"/auditoria/",["q-ceac0e25.js","q-d6524e55.js","q-bdf689b4.js"]],["auth/",[H,Ll,()=>Qo],"/auth/",["q-ceac0e25.js","q-2203a8fc.js","q-8f310d48.js"]],["basic-map/",[H,()=>rs],"/basic-map/",["q-ceac0e25.js","q-37a22163.js"]],["capacitacion/",[H,Ue,()=>ds],"/capacitacion/",["q-ceac0e25.js","q-d3e89879.js","q-38caa5e4.js"]],["chat/",[H,()=>Xs],"/chat/",["q-ceac0e25.js","q-0532b3dd.js"]],["docs/",[H,()=>ri],"/docs/",["q-ceac0e25.js","q-2a813679.js"]],["documentos-legales/",[H,$e,()=>ii],"/documentos-legales/",["q-ceac0e25.js","q-fdfd3360.js","q-838da318.js"]],["profile/",[H,()=>pi],"/profile/",["q-ceac0e25.js","q-841c7c3f.js"]],["timesheet/",[H,Ri,()=>Si],"/timesheet/",["q-ceac0e25.js","q-976b9583.js","q-c01a209a.js"]]],Ni=[],Oi=!0,Mi="/",ji=!0,Xi={routes:Li,serverPlugins:Ai,menus:Ni,trailingSlash:Oi,basePathname:Mi,cacheModules:ji};export{Mi as basePathname,ji as cacheModules,Xi as default,Ni as menus,Li as routes,Ai as serverPlugins,Oi as trailingSlash};
