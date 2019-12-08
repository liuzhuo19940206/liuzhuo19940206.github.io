$(document).pjax('a','#pjax-container',{
    fragment: '#pjax-container',
    timeout: 5000,
    cache: false
}).on('pjax:complete',
  function () {
  //自定义函数
}).on('pjax:send',
function() {
$('html,body').animate({ scrollTop: 0 }, 700);
//此处可添加其他的pjax开始加载时执行的事件
 console.log('自頂了~~~');
});
