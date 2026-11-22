if ('serviceWorker' in navigator && window.isSecureContext) {
 navigator.serviceWorker.register('/demo-sw.js', {scope:'/demo.html'}).catch(() => {});
}
