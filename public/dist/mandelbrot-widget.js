(()=>{var t={827:(t,e,n)=>{"use strict";t.exports=n.p+"b430d5a5c3ca886dbc8c.js"}},e={};function n(a){var s=e[a];if(void 0!==s)return s.exports;var o=e[a]={exports:{}};return t[a](o,o.exports,n),o.exports}n.m=t,n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{var t;n.g.importScripts&&(t=n.g.location+"");var e=n.g.document;if(!t&&e&&(e.currentScript&&(t=e.currentScript.src),!t)){var a=e.getElementsByTagName("script");if(a.length)for(var s=a.length-1;s>-1&&!t;)t=a[s--].src}if(!t)throw new Error("Automatic publicPath is not supported in this browser");t=t.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),n.p=t})(),n.b=document.baseURI||self.location.href,(()=>{class t extends HTMLElement{static observedAttributes=[];constructor(){super();const t=this.attachShadow({mode:"open"}),e=document.createElement("template");e.innerHTML='\n            <div class="canvas-container">\n                <canvas id="mandelbrot-canvas"></canvas>\n                <div class="canvas-controls">\n                    <span class="plus" title="Zoom in">+</span>\n                    <span class="center" title="Center">&#9678;</span>\n                    <span class="minus" title="Zoom out">&minus;</span>\n                    <span class="larr" title="Move left">&larr;</span>\n                    <span class="uarr" title="Move up">&uarr;</span>\n                    <span class="darr" title="Move down">&darr;</span>\n                    <span class="rarr" title="Move right">&rarr;</span>\n                    <span class="download" title="Download image">&#10515;</span>\n                    <span class="fullscreen" title="Fullscreen">&#9974;</span>\n                </div>\n                <div class="contextmenu">\n                    <button>Switch z</button>\n                </div>\n            </div>',t.appendChild(e.content.cloneNode(!0));const n=document.createElement("style");console.log(n.isConnected),n.textContent=`\n      .canvas-container {\n      position: relative;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      overflow: hidden;\n      ${this.getAttribute("width")?`max-width: ${this.getAttribute("width")}px`:""};\n      min-width: 250px;\n      margin: 0 auto;\n      width: 100%;\n      border-radius: 1em;\n      aspect-ratio: 3/2;\n      }\n\n      .canvas-container:fullscreen {\n      background-color: hsl(0, 0%, 15%) !important;\n      }\n\n      .canvas-container:fullscreen canvas {\n      width: calc((3 / 2) * 100vh);\n      }\n\n      canvas {\n      width: 100%;\n      background-color: rgba(0, 0, 0, 0.05);\n      }\n\n      canvas.panning {\n      cursor: all-scroll;\n      }\n\n      .canvas-container .contextmenu {\n      position: absolute;\n      visibility: hidden;\n      overflow-wrap: break-word;\n      max-width: 150px;\n      }\n\n      .canvas-container .contextmenu.show {\n      visibility: visible;\n      }\n\n      .contextmenu button {\n      all: unset;\n      background: rgba(155, 155, 155, 0.5);\n      font-size: 0.85rem;\n      color: white;\n      padding: 0.5em 1em;\n      border-radius: 0.5em;\n      cursor: pointer;\n      }\n\n      .contextmenu button:hover {\n      background: rgba(155, 155, 155, 0.8) !important;\n      }\n\n      .canvas-controls {\n      color: rgba(255, 255, 255, 0.6);\n      display: flex;\n      justify-content: flex-end;\n      align-items: center;\n      gap: 0.5rem;\n      position: absolute;\n      padding-block: 4px;\n      padding-inline: 8px;\n      font-size: 150%;\n      bottom: 0;\n      right: 0;\n      border-radius: 6px;\n      }\n      .canvas-controls * {\n      cursor: pointer;\n      }\n\n      .canvas-controls *:hover {\n      color: rgba(255, 255, 255, 0.8);\n      }\n\n      .canvas-controls:hover {\n      background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));\n      }`,t.appendChild(n)}connectedCallback(){const t=this.shadowRoot;{let e=[-2,1],a=[1,-1],s=[];const o=[],i=[],r=.8;let c,l,h=!0,d={re:0,im:0},g="true"===this.getAttribute("random"),v=!1,u=navigator.hardwareConcurrency,p=new Array(u);for(let D=0;D<u;++D){const C=new URL(n(827),n.b);p[D]=new Worker(C,{name:D})}let m=S();const f=t.querySelector("#mandelbrot-canvas");let w=f.getContext("2d");function b(n){const{name:o,col:i,theSets:r}=n,c=w.createImageData(1,w.canvas.height);s.length>0&&p[o].postMessage({w:w.canvas.width,h:w.canvas.height,realSet:e,imagSet:a,isSettingUp:!1,mandel:h,point:d,iterationCount:Number(t.host.getAttribute("iterations"))||100,col:g?s.splice(Math.floor(Math.random()*s.length),1)[0]:s.shift()});for(let t=0;t<4*w.canvas.height;t++){const e=r[Math.floor(t/4)];t%4==0&&(c.data[t+0]=m[e.in?0:e.iterations%m.length][0],c.data[t+1]=m[e.in?0:e.iterations%m.length][1],c.data[t+2]=m[e.in?0:e.iterations%m.length][2],c.data[t+3]=255)}w.putImageData(c,i,0)}w.canvas.width=f.offsetWidth/1,w.canvas.height=w.canvas.width*(2/3),k(w,y,p),w.createImageData(1,w.canvas.height),L(p);const x=t.querySelector(".contextmenu button");function L(n){n[0].postMessage({w:w.canvas.width,h:w.canvas.height,realSet:e,imagSet:a,isSettingUp:!0,mandel:h,point:d,iterationCount:Number(t.host.getAttribute("iterations"))||100}),n.forEach((t=>{t.addEventListener("message",(function(t){b(t.data)}))})),y(n)}function y(n){for(let t=0;t<w.canvas.width;t++)s[t]=t;n.forEach(((n,o)=>{n.postMessage({w:w.canvas.width,h:w.canvas.height,realSet:e,imagSet:a,isSettingUp:!1,mandel:h,point:d,iterationCount:Number(t.host.getAttribute("iterations"))||100,col:g?s.splice(Math.floor(Math.random()*s.length),1)[0]:s.shift()})}))}function k(t,e,n){s=[];new ResizeObserver(function(t,e){let n=!1;return(...a)=>{n||(t(...a),n=!0,setTimeout((()=>{n=!1}),e))}}((a=>{a.forEach((a=>{const s=t.canvas.toDataURL("image/png");var o=new Image;o.addEventListener("load",(function(){t.drawImage(o,0,0,t.canvas.width,t.canvas.height)})),o.src=s,t.canvas.width=a.target.offsetWidth/1,t.canvas.height=t.canvas.width*(2/3),e(n)}))}),250)).observe(t.canvas)}function E(t,e,n){return n[0]+t/e*(n[1]-n[0])}function M(e){t.fullscreenElement?t.fullscreenElement&&document.exitFullscreen():e.requestFullscreen()}function S(){let e,n,a,s;switch(t.host.getAttribute("palette")){case"grayscale":n=[211,211,211],a=[2*n[0]/3,2*n[1]/3,2*n[2]/3],s=[n[0]/3,n[1]/3,n[2]/3];break;case"colorful":default:n=[165,42,42],a=[70,130,180],s=[152,251,152];break;case"blue":n=[30,144,255],a=[2*n[0]/3,2*n[1]/3,2*n[2]/3],s=[n[0]/3,n[1]/3,n[2]/3]}function o(t){return function(t,e,n){let a=Math.floor((e.r-t.r)*n+t.r),s=Math.floor((e.g-t.g)*n+t.g),o=Math.floor((e.b-t.b)*n+t.b);return[a,s,o]}(e[Math.floor(t)],e[Math.floor(t)+1],t%1)}return e=[{r:n[0],g:n[1],b:n[2]},{r:a[0],g:a[1],b:a[2]},{r:s[0],g:s[1],b:s[2]}],new Array(16).fill(0).map(((t,n)=>0===n?[0,0,0]:o(n/16*(e.length-1))))}x.addEventListener("click",(t=>{h=!h,t.target.closest(".contextmenu").classList.remove("show"),y(p)})),f.oncontextmenu=function(n){if(n.preventDefault(),n.stopPropagation(),!t.host.getAttribute("julia")||"false"===t.host.getAttribute("julia"))return;const s=f.getBoundingClientRect(),o=n.clientX-s.left,i=n.clientY-s.top;d.re=E(o,w.canvas.width,e),d.im=E(i,w.canvas.height,a),x.innerHTML=`Switch to ${h?"Julia":"Mandelbrot"} set ${h?`at point z = ${E(o,w.canvas.width,e).toFixed(1)} ${E(i,w.canvas.height,a)<0?E(i,w.canvas.height,a).toFixed(1):"+ "+E(i,w.canvas.height,a).toFixed(1)}&nbsp;i`:""}`,MathJax.typeset(),console.log(n),console.log(n);const r=t.querySelector(".contextmenu");r.classList.add("show"),r.style.left=`${s.right<n.clientX+r.offsetWidth?o-15-r.offsetWidth:o+15}px`,r.style.top=`${s.top+s.height<n.clientY+r.offsetHeight?i-15-r.offsetHeight:i+15}px`},w.canvas.addEventListener("mousedown",(e=>{t.querySelector(".contextmenu").classList.remove("show"),e.preventDefault(),e.stopPropagation(),c=e.screenX-w.canvas.offsetLeft,l=e.screenY-w.canvas.offsetTop,v=!0,e.ctrlKey&&f.classList.add("panning")})),w.canvas.addEventListener("mouseup",(t=>{t.preventDefault(),t.stopPropagation(),v=!1,f.classList.remove("panning")})),w.canvas.addEventListener("mouseout",(t=>{t.preventDefault(),t.stopPropagation(),v=!1,f.classList.remove("panning")})),w.canvas.addEventListener("mousemove",(t=>{if(t.preventDefault(),t.stopPropagation(),!v||!t.ctrlKey)return;const n=t.screenX-w.canvas.offsetLeft,s=t.screenY-w.canvas.offsetTop;let o=n-c,i=s-l;c=n,l=s;const r=w.canvas.toDataURL("image/png");var h=new Image;h.addEventListener("load",(function(){w.drawImage(h,o,i)})),h.src=r;const d=[E(-o,w.canvas.width,e),E(w.canvas.width-o,w.canvas.width,e)],g=[E(-i,w.canvas.height,a),E(w.canvas.height-i,w.canvas.height,a)];e=d,a=g,y(p)})),f.addEventListener("wheel",(n=>{t.querySelector(".contextmenu").classList.remove("show"),n.preventDefault(),n.stopPropagation();const s=f.getBoundingClientRect(),c=n.clientX-s.left,l=n.clientY-s.top,h=n.wheelDelta>0?r:1/r,d=c*h,g=(w.canvas.width-c)*h,v=l*h,u=(w.canvas.height-l)*h,m=[E(c-d,w.canvas.width,e),E(c+g,w.canvas.width,e)],b=[E(l-v,w.canvas.height,a),E(l+u,w.canvas.height,a)];if(e=m,a=b,n.wheelDelta>0){o.push(w.getImageData(0,0,f.width,f.height));const t=w.canvas.toDataURL("image/png");var x=new Image;x.addEventListener("load",(function(){w.drawImage(x,2*d/w.canvas.width*(1/h)/2*(w.canvas.width*(1/h)-w.canvas.width)*-1,2*v/w.canvas.height*(1/h)/2*(w.canvas.height*(1/h)-w.canvas.height)*-1,w.canvas.width/h,w.canvas.height/h),i.push(w.canvas.toDataURL("image/png"))})),x.src=t}y(p)})),t.querySelector(".canvas-controls").addEventListener("click",(t=>{const n=Math.abs(e[1]-e[0]),s=Math.abs(a[1]-a[0]);switch(t.target.className){case"plus":{const t=r,n=[E(w.canvas.width/2-f.width*t/2,w.canvas.width,e),E(w.canvas.width/2+f.width*t/2,w.canvas.width,e)],s=[E(f.height/2-f.height*t/2,w.canvas.height,a),E(f.height/2+f.height*t/2,w.canvas.height,a)];e=n,a=s,o.push(w.getImageData(0,0,f.width,f.height));const l=w.canvas.toDataURL("image/png");var c=new Image;c.addEventListener("load",(function(){w.drawImage(c,-(w.canvas.width/t-w.canvas.width)/2,-(w.canvas.height/t-w.canvas.height)/2,w.canvas.width/t,w.canvas.height/t),i.push(w.canvas.toDataURL("image/png"))})),c.src=l}break;case"center":e=[-2,1],a=[1,-1];break;case"minus":{const t=1/r,n=[E(w.canvas.width/2-f.width*t/2,w.canvas.width,e),E(w.canvas.width/2+f.width*t/2,w.canvas.width,e)],s=[E(f.height/2-f.height*t/2,w.canvas.height,a),E(f.height/2+f.height*t/2,w.canvas.height,a)];e=n,a=s}break;case"larr":e[0]-=.05*n,e[1]-=.05*n;break;case"uarr":a[0]+=.05*s,a[1]+=.05*s;break;case"darr":a[0]-=.05*s,a[1]-=.05*s;break;case"rarr":e[0]+=.05*n,e[1]+=.05*n;break;case"download":let l=document.createElement("a");l.download=h?"mandelbrot.png":"julia.png",l.href=w.canvas.toDataURL(),l.click();break;case"fullscreen":return void M(t.target.closest(".canvas-container"));default:return}y(p)}))}}disconnectedCallback(){}adoptedCallback(){}attributeChangedCallback(t,e,n){}}customElements.define("mandelbrot-widget",t)})()})();