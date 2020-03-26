/**
 * Layui图标选择器
 * @author wujiawei0926@yeah.net
 * @version 1.1
 */

layui.define(['laypage', 'form'], function (exports) {
    "use strict";

    var IconPicker =function () {
        this.v = '1.1';
    }, _MOD = 'iconPicker',
        _this = this,
        $ = layui.jquery,
        laypage = layui.laypage,
        form = layui.form,
        BODY = 'body',
        TIPS = '请选择图标';

    /**
     * 渲染组件
     */
    IconPicker.prototype.render = function(options){
        var opts = options,
            // DOM选择器
            elem = opts.elem,
            // 数据类型：fontClass/unicode
            type = opts.type == null ? 'fontClass' : opts.type,
            // 是否分页：true/false
            page = opts.page == null ? true : opts.page,
            // 每页显示数量
            limit = opts.limit == null ? 12 : opts.limit,
            // 是否开启搜索：true/false
            search = opts.search == null ? true : opts.search,
            // 每个图标格子的宽度：'43px'或'20%'
            cellWidth = opts.cellWidth,
            // 点击回调
            click = opts.click,
            // 渲染成功后的回调
            success = opts.success,
            // json数据
            data = {},
            // 唯一标识
            tmp = new Date().getTime(),
            // 是否使用的class数据
            isFontClass = opts.type === 'fontClass',
            // 初始化时input的值
            ORIGINAL_ELEM_VALUE = $(elem).val(),
            TITLE = 'layui-select-title',
            TITLE_ID = 'layui-select-title-' + tmp,
            ICON_BODY = 'layui-iconpicker-' + tmp,
            PICKER_BODY = 'layui-iconpicker-body-' + tmp,
            PAGE_ID = 'layui-iconpicker-page-' + tmp,
            LIST_BOX = 'layui-iconpicker-list-box',
            selected = 'layui-form-selected',
            unselect = 'layui-unselect';

        var a = {
            init: function () {
                data = common.getData[type]();

                a.hideElem().createSelect().createBody().toggleSelect();
                a.preventEvent().inputListen();
                common.loadCss();
                
                if (success) {
                    success(this.successHandle());
                }

                return a;
            },
            successHandle: function(){
                var d = {
                    options: opts,
                    data: data,
                    id: tmp,
                    elem: $('#' + ICON_BODY)
                };
                return d;
            },
            /**
             * 隐藏elem
             */
            hideElem: function () {
                $(elem).hide();
                return a;
            },
            /**
             * 绘制select下拉选择框
             */
            createSelect: function () {
                var oriIcon = '<i class="yadmin-icon">';
                
                // 默认图标
                if(ORIGINAL_ELEM_VALUE === '') {
                    if(isFontClass) {
                        ORIGINAL_ELEM_VALUE = 'yadmin-icon-shouye';
                    } else {
                        ORIGINAL_ELEM_VALUE = 'amp;#xe6cb;';
                    }
                }

                if (isFontClass) {
                    oriIcon = '<i class="yadmin-icon '+ ORIGINAL_ELEM_VALUE +'">';
                } else {
                    oriIcon += ORIGINAL_ELEM_VALUE; 
                }
                oriIcon += '</i>';

                var selectHtml = '<div class="layui-iconpicker layui-unselect layui-form-select" id="'+ ICON_BODY +'">' +
                    '<div class="'+ TITLE +'" id="'+ TITLE_ID +'">' +
                        '<div class="layui-iconpicker-item">'+
                            '<span class="layui-iconpicker-icon layui-unselect">' +
                                oriIcon +
                            '</span>'+
                            '<i class="layui-edge"></i>' +
                        '</div>'+
                    '</div>' +
                    '<div class="layui-anim layui-anim-upbit" style="">' +
                        '123' +
                    '</div>';
                $(elem).after(selectHtml);
                return a;
            },
            /**
             * 展开/折叠下拉框
             */
            toggleSelect: function () {
                var item = '#' + TITLE_ID + ' .layui-iconpicker-item,#' + TITLE_ID + ' .layui-iconpicker-item .layui-edge';
                a.event('click', item, function (e) {
                    var $icon = $('#' + ICON_BODY);
                    if ($icon.hasClass(selected)) {
                        $icon.removeClass(selected).addClass(unselect);
                    } else {
                        // 隐藏其他picker
                        $('.layui-form-select').removeClass(selected);
                        // 显示当前picker
                        $icon.addClass(selected).removeClass(unselect);
                    }
                    e.stopPropagation();
                });
                return a;
            },
            /**
             * 绘制主体部分
             */
            createBody: function () {
                // 获取数据
                var searchHtml = '';

                if (search) {
                    searchHtml = '<div class="layui-iconpicker-search">' +
                        '<input class="layui-input">' +
                        '<i class="yadmin-icon layui-icon-picker-search"></i>' +
                        '</div>';
                }

                // 组合dom
                var bodyHtml = '<div class="layui-iconpicker-body" id="'+ PICKER_BODY +'">' +
                    searchHtml +
                        '<div class="'+ LIST_BOX +'"></div> '+
                     '</div>';
                $('#' + ICON_BODY).find('.layui-anim').eq(0).html(bodyHtml);
                a.search().createList().check().page();

                return a;
            },
            /**
             * 绘制图标列表
             * @param text 模糊查询关键字
             * @returns {string}
             */
            createList: function (text) {
                var d = data,
                    l = d.length,
                    pageHtml = '',
                    listHtml = $('<div class="layui-iconpicker-list">')//'<div class="layui-iconpicker-list">';

                // 计算分页数据
                var _limit = limit, // 每页显示数量
                    _pages = l % _limit === 0 ? l / _limit : parseInt(l / _limit + 1), // 总计多少页
                    _id = PAGE_ID;

                // 图标列表
                var icons = [];

                for (var i = 0; i < l; i++) {
                    var obj = d[i];

                    // 判断是否模糊查询
                    if (text && obj.indexOf(text) === -1) {
                        continue;
                    }

                    // 是否自定义格子宽度
                    var style = '';
                    if (cellWidth !== null) {
                        style += ' style="width:' + cellWidth + '"';
                    }

                    // 每个图标dom
                    var icon = '<div class="layui-iconpicker-icon-item" title="'+ obj +'" '+ style +'>';
                    if (isFontClass){
                        icon += '<i class="yadmin-icon '+ obj +'"></i>';
                    } else {
                        icon += '<i class="yadmin-icon">'+ obj.replace('amp;', '') +'</i>';
                    }
                    icon += '</div>';

                    icons.push(icon);
                }

                // 查询出图标后再分页
                l = icons.length;
                _pages = l % _limit === 0 ? l / _limit : parseInt(l / _limit + 1);
                for (var i = 0; i < _pages; i++) {
                    // 按limit分块
                    var lm = $('<div class="layui-iconpicker-icon-limit" id="layui-iconpicker-icon-limit-' + tmp + (i+1) +'">');

                    for (var j = i * _limit; j < (i+1) * _limit && j < l; j++) {
                        lm.append(icons[j]);
                    }

                    listHtml.append(lm);
                }

                // 无数据
                if (l === 0) {
                    listHtml.append('<p class="layui-iconpicker-tips">无数据</p>');
                }

                // 判断是否分页
                if (page){
                    $('#' + PICKER_BODY).addClass('layui-iconpicker-body-page');
                    pageHtml = '<div class="layui-iconpicker-page" id="'+ PAGE_ID +'">' +
                        '<div class="layui-iconpicker-page-count">' +
                        '<span id="'+ PAGE_ID +'-current">1</span>/' +
                        '<span id="'+ PAGE_ID +'-pages">'+ _pages +'</span>' +
                        ' (<span id="'+ PAGE_ID +'-length">'+ l +'</span>)' +
                        '</div>' +
                        '<div class="layui-iconpicker-page-operate">' +
                        '<i class="layui-icon" id="'+ PAGE_ID +'-prev" data-index="0" prev>&#xe603;</i> ' +
                        '<i class="layui-icon" id="'+ PAGE_ID +'-next" data-index="2" next>&#xe602;</i> ' +
                        '</div>' +
                        '</div>';
                }


                $('#' + ICON_BODY).find('.layui-anim').find('.' + LIST_BOX).html('').append(listHtml).append(pageHtml);
                return a;
            },
            // 阻止Layui的一些默认事件
            preventEvent: function() {
                var item = '#' + ICON_BODY + ' .layui-anim';
                a.event('click', item, function (e) {
                    e.stopPropagation();
                });
                return a;
            },
            // 分页
            page: function () {
                var icon = '#' + PAGE_ID + ' .layui-iconpicker-page-operate .layui-icon';

                $(icon).unbind('click');
                a.event('click', icon, function (e) {
                   var elem = e.currentTarget,
                       total = parseInt($('#' +PAGE_ID + '-pages').html()),
                       isPrev = $(elem).attr('prev') !== undefined,
                       // 按钮上标的页码
                       index = parseInt($(elem).attr('data-index')),
                       $cur = $('#' +PAGE_ID + '-current'),
                       // 点击时正在显示的页码
                       current = parseInt($cur.html());

                    // 分页数据
                    if (isPrev && current > 1) {
                        current=current-1;
                        $(icon + '[prev]').attr('data-index', current);
                    } else if (!isPrev && current < total){
                        current=current+1;
                        $(icon + '[next]').attr('data-index', current);
                    }
                    $cur.html(current);

                    // 图标数据
                    $('#'+ ICON_BODY + ' .layui-iconpicker-icon-limit').hide();
                    $('#layui-iconpicker-icon-limit-' + tmp + current).show();
                    e.stopPropagation();
                });
                return a;
            },
            /**
             * 搜索
             */
            search: function () {
                var item = '#' + PICKER_BODY + ' .layui-iconpicker-search .layui-input';
                a.event('input propertychange', item, function (e) {
                    var elem = e.target,
                        t = $(elem).val();
                    a.createList(t);
                });
                return a;
            },
            /**
             * 点击选中图标
             */
            check: function () {
                var item = '#' + PICKER_BODY + ' .layui-iconpicker-icon-item';
                a.event('click', item, function (e) {
                    var el = $(e.currentTarget).find('.yadmin-icon'),
                        icon = '';
                    if (isFontClass) {
                        var clsArr = el.attr('class').split(/[\s\n]/),
                            cls = clsArr[1],
                            icon = cls;
                        $('#' + TITLE_ID).find('.layui-iconpicker-item .yadmin-icon').html('').attr('class', clsArr.join(' '));
                    } else {
                        var cls = el.html(),
                            icon = cls;
                        $('#' + TITLE_ID).find('.layui-iconpicker-item .yadmin-icon').html(icon);
                    }

                    $('#' + ICON_BODY).removeClass(selected).addClass(unselect);
                    $(elem).val(icon).attr('value', icon);
                    // 回调
                    if (click) {
                        click({
                            icon: icon
                        });
                    }

                });
                return a;
            },
            // 监听原始input数值改变
            inputListen: function(){
                var el = $(elem);
                a.event('change', elem, function(){
                    var value = el.val();
                });
                // el.change(function(){
                    
                // });
                return a;
            },
            event: function (evt, el, fn) {
                $(BODY).on(evt, el, fn);
            }
        };

        var common = {
            /**
             * 加载样式表
             */
            loadCss: function () {
                var css = '.layui-iconpicker {max-width: 280px;}.layui-iconpicker .layui-anim{display:none;position:absolute;left:0;top:42px;padding:5px 0;z-index:899;min-width:100%;border:1px solid #d2d2d2;max-height:300px;overflow-y:auto;background-color:#fff;border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,.12);box-sizing:border-box;}.layui-iconpicker-item{border:1px solid #e6e6e6;width:90px;height:38px;border-radius:4px;cursor:pointer;position:absolute;}.layui-iconpicker-icon{border-right:1px solid #e6e6e6;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;width:60px;height:100%;float:left;text-align:center;background:#fff;transition:all .3s;}.layui-iconpicker-icon i{line-height:38px;font-size:18px;}.layui-iconpicker-item > .layui-edge{left:70px;}.layui-iconpicker-item:hover{border-color:#D2D2D2!important;}.layui-iconpicker-item:hover .layui-iconpicker-icon{border-color:#D2D2D2!important;}.layui-iconpicker.layui-form-selected .layui-anim{display:block;}.layui-iconpicker-body{padding:6px;}.layui-iconpicker .layui-iconpicker-list{background-color:#fff;border:1px solid #ccc;border-radius:4px;}.layui-iconpicker .layui-iconpicker-icon-item{display:inline-block;width:21.1%;line-height:36px;text-align:center;cursor:pointer;vertical-align:top;height:36px;margin:4px;border:1px solid #ddd;border-radius:2px;transition:300ms;}.layui-iconpicker .layui-iconpicker-icon-item i.layui-icon{font-size:17px;}.layui-iconpicker .layui-iconpicker-icon-item:hover{background-color:#eee;border-color:#ccc;-webkit-box-shadow:0 0 2px #aaa,0 0 2px #fff inset;-moz-box-shadow:0 0 2px #aaa,0 0 2px #fff inset;box-shadow:0 0 2px #aaa,0 0 2px #fff inset;text-shadow:0 0 1px #fff;}.layui-iconpicker-search{position:relative;margin:0 0 6px 0;border:1px solid #e6e6e6;border-radius:2px;transition:300ms;}.layui-iconpicker-search:hover{border-color:#D2D2D2!important;}.layui-iconpicker-search .layui-input{cursor:text;display:inline-block;width:86%;border:none;padding-right:0;margin-top:1px;}.layui-iconpicker-search .layui-icon{position:absolute;top:11px;right:4%;}.layui-iconpicker-tips{text-align:center;padding:8px 0;cursor:not-allowed;}.layui-iconpicker-page{margin-top:6px;margin-bottom:-6px;font-size:12px;padding:0 2px;}.layui-iconpicker-page-count{display:inline-block;}.layui-iconpicker-page-operate{display:inline-block;float:right;cursor:default;}.layui-iconpicker-page-operate .layui-icon{font-size:12px;cursor:pointer;}.layui-iconpicker-body-page .layui-iconpicker-icon-limit{display:none;}.layui-iconpicker-body-page .layui-iconpicker-icon-limit:first-child{display:block;}';
                var $style = $('head').find('style[iconpicker]');
                if ($style.length === 0) {
                    $('head').append('<style rel="stylesheet" iconpicker>'+css+'</style>');
                }
            },
            /**
             * 获取数据
             */
            getData: {
                fontClass: function () {
                    return ['yadmin-icon-shouye', 'yadmin-icon-quanxianguankong', 'yadmin-icon-quanxian', 'yadmin-icon-GitHub', 'yadmin-icon-tiaoshi', 'yadmin-icon-changjingguanli', 'yadmin-icon-bianji', 'yadmin-icon-guanlianshebei', 'yadmin-icon-guanfangbanben', 'yadmin-icon-gongnengdingyi', 'yadmin-icon-jichuguanli', 'yadmin-icon-jishufuwu', 'yadmin-icon-hezuohuobanmiyueguanli', 'yadmin-icon-ceshishenqing', 'yadmin-icon-jiedianguanli', 'yadmin-icon-jinggao', 'yadmin-icon-peiwangyindao', 'yadmin-icon-renjijiaohu', 'yadmin-icon-shiyongwendang', 'yadmin-icon-quanxianshenpi', 'yadmin-icon-yishouquan', 'yadmin-icon-tianshenpi', 'yadmin-icon-shujukanban', 'yadmin-icon-yingyongguanli', 'yadmin-icon-yibiaopan', 'yadmin-icon-zhanghaoquanxianguanli', 'yadmin-icon-yuanquyunwei', 'yadmin-icon-jizhanguanli', 'yadmin-icon-guanbi', 'yadmin-icon-zidingyi', 'yadmin-icon-xiajiantou', 'yadmin-icon-shangjiantou', 'yadmin-icon-icon_loading', 'yadmin-icon-icon_renwujincheng', 'yadmin-icon-icon_rukou', 'yadmin-icon-icon_yiwenkongxin', 'yadmin-icon-icon_fabu', 'yadmin-icon-icon_tianjia', 'yadmin-icon-icon_yulan', 'yadmin-icon-icon_zhanghao', 'yadmin-icon-icon_wangye', 'yadmin-icon-icon_shezhi', 'yadmin-icon-icon_baocun', 'yadmin-icon-icon_yingyongguanli', 'yadmin-icon-icon_shiyongwendang', 'yadmin-icon-icon_bangzhuwendang', 'yadmin-icon-biaodanzujian-shurukuang', 'yadmin-icon-biaodanzujian-biaoge', 'yadmin-icon-biaodanzujian-xialakuang', 'yadmin-icon-tubiao-bingtu', 'yadmin-icon-biaodanzujian-anniu', 'yadmin-icon-gongyezujian-yibiaopan', 'yadmin-icon-tubiao-qiapian', 'yadmin-icon-gongyezujian-zhishideng', 'yadmin-icon-tubiao-zhexiantu', 'yadmin-icon-xingzhuang-juxing', 'yadmin-icon-xingzhuang-jianxing', 'yadmin-icon-gongyezujian-kaiguan', 'yadmin-icon-tubiao-zhuzhuangtu', 'yadmin-icon-xingzhuang-tupian', 'yadmin-icon-xingzhuang-wenzi', 'yadmin-icon-xingzhuang-tuoyuanxing', 'yadmin-icon-xingzhuang-sanjiaoxing', 'yadmin-icon-xingzhuang-xingxing', 'yadmin-icon-xinzeng', 'yadmin-icon-guize', 'yadmin-icon-shebeiguanli', 'yadmin-icon-gongnengdingyi1', 'yadmin-icon-jishufuwu1', 'yadmin-icon-yunyingzhongxin', 'yadmin-icon-yunyingguanli', 'yadmin-icon-zuzhixiaxia', 'yadmin-icon-zuzhizhankai', 'yadmin-icon-zuzhiqunzu', 'yadmin-icon-dakai', 'yadmin-icon-yingwen', 'yadmin-icon-zhongwen', 'yadmin-icon-miwen', 'yadmin-icon-xianhao', 'yadmin-icon-kongxinduigou', 'yadmin-icon-huixingzhen', 'yadmin-icon-duigou', 'yadmin-icon-xiayibu', 'yadmin-icon-shangyibu', 'yadmin-icon-kongjianxuanzhong', 'yadmin-icon-kongjianweixuan', 'yadmin-icon-kongjianyixuan', 'yadmin-icon--diangan', 'yadmin-icon-rongxuejirongjiechi', 'yadmin-icon-lubiantingchechang', 'yadmin-icon--lumingpai', 'yadmin-icon-jietouzuoyi', 'yadmin-icon--zhongdaweixian', 'yadmin-icon--jiaotongbiaozhipai', 'yadmin-icon-gongcezhishipai', 'yadmin-icon-fangkuai', 'yadmin-icon-fangkuai-', 'yadmin-icon-shuaxin', 'yadmin-icon-baocun', 'yadmin-icon-fabu', 'yadmin-icon-xiayibu1', 'yadmin-icon-shangyibu1', 'yadmin-icon-xiangxiazhanhang', 'yadmin-icon-xiangshangzhanhang', 'yadmin-icon-tupianjiazaishibai', 'yadmin-icon-fuwudiqiu', 'yadmin-icon-setting', 'yadmin-icon-edit-square', 'yadmin-icon-delete', 'yadmin-icon-minus', 'yadmin-icon-suoxiao', 'yadmin-icon-fangda', 'yadmin-icon-huanyuanhuabu', 'yadmin-icon-quanping', 'yadmin-icon-biaodanzujian-biaoge1', 'yadmin-icon-APIshuchu', 'yadmin-icon-APIjieru', 'yadmin-icon-wenjianjia', 'yadmin-icon-DOC', 'yadmin-icon-BMP', 'yadmin-icon-GIF', 'yadmin-icon-JPG', 'yadmin-icon-PNG', 'yadmin-icon-weizhigeshi', 'yadmin-icon-gengduo', 'yadmin-icon-yunduanxiazai', 'yadmin-icon-yunduanshangchuan', 'yadmin-icon-dian', 'yadmin-icon-mian', 'yadmin-icon-xian', 'yadmin-icon-clean', 'yadmin-icon-shebeizhuangtai', 'yadmin-icon-fenzuguanli', 'yadmin-icon-kuaisubianpai', 'yadmin-icon-APPkaifa', 'yadmin-icon-wentijieda', 'yadmin-icon-kefu', 'yadmin-icon-ruanjiankaifabao', 'yadmin-icon-shangyimian', 'yadmin-icon-xiayimian', 'yadmin-icon-zhidimian', 'yadmin-icon-zhidingmian', 'yadmin-icon-sousuobianxiao', 'yadmin-icon-sousuofangda', 'yadmin-icon-dingwei', 'yadmin-icon-wumoxing', 'yadmin-icon-gaojing', 'yadmin-icon-renwujincheng', 'yadmin-icon-xiaoxitongzhi', 'yadmin-icon-youhui', 'yadmin-icon-gaojing1', 'yadmin-icon-zhihangfankui', 'yadmin-icon-gongdanqueren', 'yadmin-icon-guangbo', 'yadmin-icon-gongdan', 'yadmin-icon-xiaoxi', 'yadmin-icon-ditu-qi', 'yadmin-icon-ditu-dibiao', 'yadmin-icon-ditu-cha', 'yadmin-icon-ditu-qipao', 'yadmin-icon-ditu-tuding', 'yadmin-icon-ditu-huan', 'yadmin-icon-ditu-xing', 'yadmin-icon-ditu-yuan', 'yadmin-icon-chehuisekuai', 'yadmin-icon-shanchusekuai', 'yadmin-icon-fabusekuai', 'yadmin-icon-xinhao', 'yadmin-icon-lanya', 'yadmin-icon-Wi-Fi', 'yadmin-icon-chaxun', 'yadmin-icon-dianbiao', 'yadmin-icon-anquan', 'yadmin-icon-daibanshixiang', 'yadmin-icon-bingxiang', 'yadmin-icon-fanshe', 'yadmin-icon-fengche', 'yadmin-icon-guandao', 'yadmin-icon-guize1', 'yadmin-icon-guizeyinqing', 'yadmin-icon-huowudui', 'yadmin-icon-jianceqi', 'yadmin-icon-jinggai', 'yadmin-icon-liujisuan', 'yadmin-icon-hanshu', 'yadmin-icon-lianjieliu', 'yadmin-icon-ludeng', 'yadmin-icon-shexiangji', 'yadmin-icon-rentijiance', 'yadmin-icon-moshubang', 'yadmin-icon-shujuwajue', 'yadmin-icon-wangguan', 'yadmin-icon-shenjing', 'yadmin-icon-chucun', 'yadmin-icon-wuguan', 'yadmin-icon-yunduanshuaxin', 'yadmin-icon-yunhang', 'yadmin-icon-luyouqi', 'yadmin-icon-bug', 'yadmin-icon-get', 'yadmin-icon-PIR', 'yadmin-icon-zhexiantu', 'yadmin-icon-shuibiao', 'yadmin-icon-js', 'yadmin-icon-zihangche', 'yadmin-icon-liebiao', 'yadmin-icon-qichedingwei', 'yadmin-icon-dici', 'yadmin-icon-mysql', 'yadmin-icon-qiche', 'yadmin-icon-shenjing1', 'yadmin-icon-chengshi', 'yadmin-icon-tixingshixin', 'yadmin-icon-menci', 'yadmin-icon-chazuo', 'yadmin-icon-ranqijianceqi', 'yadmin-icon-kaiguan', 'yadmin-icon-chatou', 'yadmin-icon-xiyiji', 'yadmin-icon-yijiankaiguan', 'yadmin-icon-yanwubaojingqi', 'yadmin-icon-wuxiandianbo', 'yadmin-icon-fuzhi', 'yadmin-icon-shanchu', 'yadmin-icon-wuquanxian', 'yadmin-icon-bianjisekuai', 'yadmin-icon-ishipinshixiao', 'yadmin-icon-iframetianjia', 'yadmin-icon-tupiantianjia', 'yadmin-icon-liebiaomoshi_kuai', 'yadmin-icon-qiapianmoshi_kuai', 'yadmin-icon-fenlan', 'yadmin-icon-fengexian', 'yadmin-icon-dianzan', 'yadmin-icon-charulianjie', 'yadmin-icon-charutupian', 'yadmin-icon-quxiaolianjie', 'yadmin-icon-wuxupailie', 'yadmin-icon-juzhongduiqi', 'yadmin-icon-yinyong', 'yadmin-icon-youxupailie', 'yadmin-icon-youduiqi', 'yadmin-icon-zitidaima', 'yadmin-icon-xiaolian', 'yadmin-icon-zitijiacu', 'yadmin-icon-zitishanchuxian', 'yadmin-icon-zitishangbiao', 'yadmin-icon-zitibiaoti', 'yadmin-icon-zitixiahuaxian', 'yadmin-icon-zitixieti', 'yadmin-icon-zitiyanse', 'yadmin-icon-zuoduiqi', 'yadmin-icon-zitiyulan', 'yadmin-icon-zitixiabiao', 'yadmin-icon-zuoyouduiqi', 'yadmin-icon-tianxie', 'yadmin-icon-huowudui1', 'yadmin-icon-yingjian', 'yadmin-icon-shebeikaifa', 'yadmin-icon-dianzan_kuai', 'yadmin-icon-zhihuan', 'yadmin-icon-tuoguan', 'yadmin-icon-search', 'yadmin-icon-duigoux', 'yadmin-icon-guanbi1', 'yadmin-icon-aixin_shixin', 'yadmin-icon-ranqixieloubaojingqi', 'yadmin-icon-dianbiao_shiti', 'yadmin-icon-aixin', 'yadmin-icon-shuibiao_shiti', 'yadmin-icon-zhinengxiaofangshuan', 'yadmin-icon-ranqibiao_shiti', 'yadmin-icon-shexiangtou_shiti', 'yadmin-icon-shexiangtou_guanbi', 'yadmin-icon-shexiangtou', 'yadmin-icon-shengyin_shiti', 'yadmin-icon-shengyinkai', 'yadmin-icon-shoucang_shixin', 'yadmin-icon-shoucang', 'yadmin-icon-shengyinwu', 'yadmin-icon-shengyinjingyin', 'yadmin-icon-zhunbeiliangchan', 'yadmin-icon-shebeikaifa1', 'yadmin-icon-quanxianguanli', 'yadmin-icon-wuquanxianfangwen', 'yadmin-icon-plus', 'yadmin-icon-kongxinwenhao', 'yadmin-icon-cuowukongxin', 'yadmin-icon-fangkuai1', 'yadmin-icon-fangkuai2', 'yadmin-icon-kongjianxuanzhong1', 'yadmin-icon-kongxinduigou1', 'yadmin-icon-xinxikongxin', 'yadmin-icon-kongjian', 'yadmin-icon-gaojingkongxin', 'yadmin-icon-duigou_kuai', 'yadmin-icon-cuocha_kuai', 'yadmin-icon-jia_sekuai', 'yadmin-icon-jian_sekuai', 'yadmin-icon-fenxiangfangshi', 'yadmin-icon-icon_qiangzhixiaxian', 'yadmin-icon-icon-test', 'yadmin-icon-icon-test1', 'yadmin-icon-icon-test2', 'yadmin-icon-icon-test3', 'yadmin-icon-icon-test4', 'yadmin-icon-icon-test5', 'yadmin-icon-icon-test6', 'yadmin-icon-icon-test7', 'yadmin-icon-icon-test8', 'yadmin-icon-icon-test9', 'yadmin-icon-icon-test10', 'yadmin-icon-icon-test11', 'yadmin-icon-icon-test12', 'yadmin-icon-icon-test13', 'yadmin-icon-icon-test14', 'yadmin-icon-icon-test15', 'yadmin-icon-icon-test16', 'yadmin-icon-icon-test17', 'yadmin-icon-icon-test18', 'yadmin-icon-icon-test19', 'yadmin-icon-icon-test20', 'yadmin-icon-icon-test21', 'yadmin-icon-icon-test22', 'yadmin-icon-icon-test23', 'yadmin-icon-icon-test24', 'yadmin-icon-icon-test25', 'yadmin-icon-icon-test26', 'yadmin-icon-icon-test27', 'yadmin-icon-icon-test28', 'yadmin-icon-icon-test29', 'yadmin-icon-icon-test30', 'yadmin-icon-icon-test31', 'yadmin-icon-icon-test32', 'yadmin-icon-icon-test33', 'yadmin-icon-icon-test34', 'yadmin-icon-icon-test35', 'yadmin-icon-icon-test36', 'yadmin-icon-icon-test37', 'yadmin-icon-icon-test38', 'yadmin-icon-icon-test39', 'yadmin-icon-icon-test40', 'yadmin-icon-icon-test41', 'yadmin-icon-icon-test42', 'yadmin-icon-icon-test43', 'yadmin-icon-icon-test44', 'yadmin-icon-icon-test45', 'yadmin-icon-icon-test46', 'yadmin-icon-icon-test47', 'yadmin-icon-icon-test48', 'yadmin-icon-icon-test49', 'yadmin-icon-icon-test50', 'yadmin-icon-icon-test51', 'yadmin-icon-icon-test52', 'yadmin-icon-icon-test53', 'yadmin-icon-icon-test54', 'yadmin-icon-icon-test55', 'yadmin-icon-icon-test56', 'yadmin-icon-icon-test57', 'yadmin-icon-icon-test58', 'yadmin-icon-icon-test59', 'yadmin-icon-icon-test60', 'yadmin-icon-icon-test61', 'yadmin-icon-icon-test62', 'yadmin-icon-icon-test63', 'yadmin-icon-icon-test64', 'yadmin-icon-icon-test65', 'yadmin-icon-icon-test66', 'yadmin-icon-icon-test67', 'yadmin-icon-icon-test68', 'yadmin-icon-icon-test69', 'yadmin-icon-icon-test70', 'yadmin-icon-icon-test71', 'yadmin-icon-icon-test72', 'yadmin-icon-icon-test73', 'yadmin-icon-icon-test74', 'yadmin-icon-icon-test75', 'yadmin-icon-icon-test76', 'yadmin-icon-icon-test77', 'yadmin-icon-icon-test78', 'yadmin-icon-icon-test79', 'yadmin-icon-icon-test80', 'yadmin-icon-icon-test82', 'yadmin-icon-icon-test83', 'yadmin-icon-icon-test84', 'yadmin-icon-alipay', 'yadmin-icon-taobao'];
                },
                unicode: function () {
                    return ['amp;#xe6cb;','amp;#xe67d;','amp;#xe612;','amp;#xea0a;','amp;#xeb61;','amp;#xeb62;','amp;#xeb63;','amp;#xeb64;','amp;#xeb65;','amp;#xeb66;','amp;#xeb67;','amp;#xeb68;','amp;#xeb69;','amp;#xeb6a;','amp;#xeb6b;','amp;#xeb6c;','amp;#xeb6d;','amp;#xeb6e;','amp;#xeb6f;','amp;#xeb70;','amp;#xeb71;','amp;#xeb72;','amp;#xeb73;','amp;#xeb74;','amp;#xeb75;','amp;#xeb76;','amp;#xeb77;','amp;#xeb78;','amp;#xeb79;','amp;#xeb7a;','amp;#xeb7b;','amp;#xeb7c;','amp;#xeb80;','amp;#xeb88;','amp;#xeb89;','amp;#xeb8a;','amp;#xeb8b;','amp;#xeb8c;','amp;#xeb8d;','amp;#xeb8e;','amp;#xeb8f;','amp;#xeb90;','amp;#xeb91;','amp;#xeb92;','amp;#xeb93;','amp;#xeb94;','amp;#xeb95;','amp;#xeb96;','amp;#xeb97;','amp;#xeb98;','amp;#xeb99;','amp;#xeb9a;','amp;#xeb9b;','amp;#xeb9c;','amp;#xeb9d;','amp;#xeb9e;','amp;#xeb9f;','amp;#xeba0;','amp;#xeba1;','amp;#xeba2;','amp;#xeba3;','amp;#xeba4;','amp;#xeba5;','amp;#xeba6;','amp;#xe600;','amp;#xebb7;','amp;#xebb8;','amp;#xebb9;','amp;#xebce;','amp;#xebd0;','amp;#xebd1;','amp;#xebd8;','amp;#xebd9;','amp;#xebda;','amp;#xebdf;','amp;#xebe0;','amp;#xebe2;','amp;#xebe3;','amp;#xebe4;','amp;#xebe5;','amp;#xebe6;','amp;#xebe7;','amp;#xebef;','amp;#xebf0;','amp;#xebf1;','amp;#xebf2;','amp;#xebf3;','amp;#xebfb;','amp;#xebfc;','amp;#xebfd;','amp;#xebfe;','amp;#xebff;','amp;#xec00;','amp;#xec01;','amp;#xec02;','amp;#xec06;','amp;#xec07;','amp;#xec08;','amp;#xec09;','amp;#xec0a;','amp;#xec0b;','amp;#xec0c;','amp;#xec0d;','amp;#xec0e;','amp;#xec0f;','amp;#xec10;','amp;#xe7a3;','amp;#xe7a6;','amp;#xe7f8;','amp;#xe88c;','amp;#xec13;','amp;#xec14;','amp;#xec15;','amp;#xec16;','amp;#xec17;','amp;#xec18;','amp;#xec19;','amp;#xec1a;','amp;#xec1b;','amp;#xec1c;','amp;#xec1d;','amp;#xec1e;','amp;#xec1f;','amp;#xec20;','amp;#xec21;','amp;#xec22;','amp;#xec23;','amp;#xec24;','amp;#xec25;','amp;#xec26;','amp;#xe6d5;','amp;#xec27;','amp;#xec28;','amp;#xec29;','amp;#xec2a;','amp;#xec2e;','amp;#xec2f;','amp;#xec30;','amp;#xe610;','amp;#xe611;','amp;#xe61a;','amp;#xe61b;','amp;#xec32;','amp;#xec33;','amp;#xec34;','amp;#xec35;','amp;#xec36;','amp;#xec37;','amp;#xec38;','amp;#xec39;','amp;#xec3a;','amp;#xec3b;','amp;#xec3c;','amp;#xec3d;','amp;#xec3e;','amp;#xec3f;','amp;#xec40;','amp;#xec41;','amp;#xec42;','amp;#xec43;','amp;#xec44;','amp;#xec45;','amp;#xec46;','amp;#xec47;','amp;#xec48;','amp;#xec49;','amp;#xec4a;','amp;#xec4b;','amp;#xec4c;','amp;#xec4d;','amp;#xec4e;','amp;#xec4f;','amp;#xec50;','amp;#xec51;','amp;#xec52;','amp;#xec53;','amp;#xec54;','amp;#xec55;','amp;#xec56;','amp;#xec57;','amp;#xec58;','amp;#xec59;','amp;#xec5a;','amp;#xec5b;','amp;#xec5c;','amp;#xec5d;','amp;#xec5e;','amp;#xec5f;','amp;#xec60;','amp;#xec61;','amp;#xec62;','amp;#xec63;','amp;#xec64;','amp;#xec65;','amp;#xec66;','amp;#xec67;','amp;#xec68;','amp;#xec69;','amp;#xec6a;','amp;#xec6b;','amp;#xec6c;','amp;#xec6d;','amp;#xec6e;','amp;#xec6f;','amp;#xec70;','amp;#xec71;','amp;#xec72;','amp;#xec73;','amp;#xec74;','amp;#xec75;','amp;#xec76;','amp;#xec77;','amp;#xec78;','amp;#xec79;','amp;#xec7a;','amp;#xec7b;','amp;#xec7c;','amp;#xec7d;','amp;#xec7e;','amp;#xec7f;','amp;#xec80;','amp;#xec81;','amp;#xec82;','amp;#xec83;','amp;#xe64c;','amp;#xec84;','amp;#xec85;','amp;#xec86;','amp;#xec87;','amp;#xec88;','amp;#xec89;','amp;#xec8a;','amp;#xec8b;','amp;#xec8c;','amp;#xec8d;','amp;#xec8e;','amp;#xec8f;','amp;#xec90;','amp;#xec91;','amp;#xec92;','amp;#xec93;','amp;#xec94;','amp;#xec95;','amp;#xec96;','amp;#xec97;','amp;#xec98;','amp;#xec99;','amp;#xec9a;','amp;#xec9b;','amp;#xec9c;','amp;#xec9d;','amp;#xec9e;','amp;#xec9f;','amp;#xeca0;','amp;#xeca1;','amp;#xeca2;','amp;#xeca3;','amp;#xeca4;','amp;#xeca5;','amp;#xeca6;','amp;#xeca7;','amp;#xeca8;','amp;#xe9a1;','amp;#xeca9;','amp;#xecaa;','amp;#xecab;','amp;#xecac;','amp;#xecad;','amp;#xecae;','amp;#xecaf;','amp;#xecb0;','amp;#xecb1;','amp;#xecb2;','amp;#xecb3;','amp;#xecb4;','amp;#xecb5;','amp;#xecb6;','amp;#xecb7;','amp;#xecb8;','amp;#xecb9;','amp;#xecba;','amp;#xecbb;','amp;#xecbc;','amp;#xe670;','amp;#xea2f;','amp;#xe9a9;','amp;#xed19;','amp;#xed1a;','amp;#xed1b;','amp;#xed1c;','amp;#xed1d;','amp;#xed1e;','amp;#xed1f;','amp;#xed20;','amp;#xed21;','amp;#xed22;','amp;#xed23;','amp;#xed24;','amp;#xed25;','amp;#xed2e;','amp;#xe7c2;','amp;#xe633;','amp;#xe634;','amp;#xe635;','amp;#xe636;','amp;#xe637;','amp;#xe638;','amp;#xe639;','amp;#xe63a;','amp;#xe63b;','amp;#xe63c;','amp;#xe63d;','amp;#xe63e;','amp;#xe63f;','amp;#xe640;','amp;#xe641;','amp;#xe642;','amp;#xe643;','amp;#xe644;','amp;#xe645;','amp;#xe646;','amp;#xe647;','amp;#xe648;','amp;#xe649;','amp;#xe64a;','amp;#xe64b;','amp;#xe64d;','amp;#xe64e;','amp;#xe64f;','amp;#xe650;','amp;#xe651;','amp;#xe652;','amp;#xe653;','amp;#xe654;','amp;#xe655;','amp;#xe656;','amp;#xe657;','amp;#xe658;','amp;#xe659;','amp;#xe65a;','amp;#xe65b;','amp;#xe65c;','amp;#xe65d;','amp;#xe65e;','amp;#xe65f;','amp;#xe660;','amp;#xe661;','amp;#xe662;','amp;#xe663;','amp;#xe664;','amp;#xe665;','amp;#xe666;','amp;#xe667;','amp;#xe668;','amp;#xe669;','amp;#xe66a;','amp;#xe66b;','amp;#xe66c;','amp;#xe66d;','amp;#xe66e;','amp;#xe66f;','amp;#xe671;','amp;#xe672;','amp;#xe673;','amp;#xe674;','amp;#xe675;','amp;#xe676;','amp;#xe677;','amp;#xe678;','amp;#xe679;','amp;#xe67a;','amp;#xe67b;','amp;#xe67c;','amp;#xe67e;','amp;#xe67f;','amp;#xe680;','amp;#xe681;','amp;#xe682;','amp;#xe683;','amp;#xe684;','amp;#xe685;','amp;#xe686;','amp;#xe688;','amp;#xe689;','amp;#xe68a;','amp;#xe68c;','amp;#xe68d;'];
                }
            }
        };

        a.init();
        return new IconPicker();
    };

    /**
     * 选中图标
     * @param filter lay-filter
     * @param iconName 图标名称，自动识别fontClass/unicode
     */
    IconPicker.prototype.checkIcon = function (filter, iconName){
        var el = $('*[lay-filter='+ filter +']'),
            p = el.next().find('.layui-iconpicker-item .yadmin-icon'),
            c = iconName;

        if (c.indexOf('#xe') > 0){
            p.html(c);
        } else {
            p.html('').attr('class', 'yadmin-icon ' + c);
        }
        el.attr('value', c).val(c);
    };

    var iconPicker = new IconPicker();
    exports(_MOD, iconPicker);
});