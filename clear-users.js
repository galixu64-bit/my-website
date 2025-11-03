// 临时脚本：清除 localStorage 中的旧用户数据
// 在浏览器控制台运行：清除后刷新页面
(function() {
    'use strict';
    console.log('清除用户数据...');
    
    // 清除旧的用户数据
    localStorage.removeItem('userDatabase');
    localStorage.removeItem('users');
    localStorage.removeItem('jsonUsersLoaded');
    
    console.log('✓ 用户数据已清除，请刷新页面');
    console.log('新账号信息：');
    console.log('  邮箱: Galixu64@gmail.com');
    console.log('  用户名: fullrushed');
    console.log('  密码: Gary0604');
    console.log('  开发者: 是');
})();

