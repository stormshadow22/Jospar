/* Local-only image editing: nothing is uploaded until Save is pressed. */
export function cropGeometry(width,height,zoom=1,centerX=width/2,centerY=height/2){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Неверные размеры изображения');
 zoom=Math.max(1,Math.min(4,Number(zoom)||1));const size=Math.min(width,height)/zoom;
 centerX=Math.max(size/2,Math.min(width-size/2,Number.isFinite(centerX)?centerX:width/2));
 centerY=Math.max(size/2,Math.min(height-size/2,Number.isFinite(centerY)?centerY:height/2));
 return {x:centerX-size/2,y:centerY-size/2,size,centerX,centerY,zoom};
}
export function createCropper(image,container){
 const canvas=container.querySelector('#cropCanvas'),ctx=canvas.getContext('2d'),zoomInput=container.querySelector('#cropZoom'),xInput=container.querySelector('#cropX'),yInput=container.querySelector('#cropY');
 let geometry=cropGeometry(image.width,image.height),pointer=null,disposed=false;
 function draw(){if(disposed)return;const {x,y,size,centerX,centerY}=geometry;ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,x,y,size,size,0,0,canvas.width,canvas.height);zoomInput.value=geometry.zoom;xInput.disabled=image.width-size<.001;yInput.disabled=image.height-size<.001;xInput.value=xInput.disabled?50:100*(centerX-size/2)/(image.width-size);yInput.value=yInput.disabled?50:100*(centerY-size/2)/(image.height-size);container.querySelector('#cropZoomValue').textContent=geometry.zoom.toFixed(2)+'×';}
 function change(){geometry=cropGeometry(image.width,image.height,Number(zoomInput.value),geometry.centerX,geometry.centerY);draw()}
 function pan(axis,value){const size=geometry.size;geometry=cropGeometry(image.width,image.height,geometry.zoom,axis==='x'?size/2+value/100*(image.width-size):geometry.centerX,axis==='y'?size/2+value/100*(image.height-size):geometry.centerY);draw()}
 const onX=()=>pan('x',Number(xInput.value)),onY=()=>pan('y',Number(yInput.value));
 function down(e){if(e.button!==0)return;e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging')}
 function move(e){if(!pointer||pointer.id!==e.pointerId)return;const ratio=geometry.size/canvas.getBoundingClientRect().width;geometry=cropGeometry(image.width,image.height,geometry.zoom,geometry.centerX-(e.clientX-pointer.x)*ratio,geometry.centerY-(e.clientY-pointer.y)*ratio);pointer.x=e.clientX;pointer.y=e.clientY;draw()}
 function up(){pointer=null;canvas.classList.remove('dragging')}
 zoomInput.addEventListener('input',change);xInput.addEventListener('input',onX);yInput.addEventListener('input',onY);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 draw();
 return {reset(){geometry=cropGeometry(image.width,image.height);draw()},geometry:()=>({...geometry}),encode(){if(disposed)throw Error('Редактор закрыт');const output=document.createElement('canvas');output.width=384;output.height=384;const o=output.getContext('2d');o.fillStyle='#fff';o.fillRect(0,0,384,384);o.drawImage(image,geometry.x,geometry.y,geometry.size,geometry.size,0,0,384,384);for(const quality of [.85,.75,.65,.5]){const url=output.toDataURL('image/jpeg',quality);if(url.length<=120000)return url}throw Error('Не удалось уменьшить фото. Выберите другое изображение.')},dispose(){if(disposed)return;disposed=true;image.close();zoomInput.removeEventListener('input',change);xInput.removeEventListener('input',onX);yInput.removeEventListener('input',onY);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up)}};
}
