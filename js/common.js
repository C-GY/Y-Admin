layui.config({
    base: "../../js/",
}).use(["yadmin", "tabRightMenu"], function () {
    var yadmin = layui.yadmin;
    var tabRightMenu = layui.tabRightMenu;

    // 渲染 tab 右键菜单.
    tabRightMenu.render({
        filter: "lay-tab",
        pintabIDs: ["main"],
        width: 110,
    });
});