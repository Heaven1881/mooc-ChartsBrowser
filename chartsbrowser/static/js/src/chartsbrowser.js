/* Javascript for ChartsBrowswerXBlock. */

String.prototype.replaceInFormat = function(repl) {
    return this.replace(/\{(\w+)\}/g, function(match, capture) {
        return repl[capture];
    });
};

function ChartsBrowswerXBlock(runtime, element) {
    // 这里是配置信息
    var filterConfig = {};
    filterConfig.baseUrl = 'http://139.129.32.184:9009/view/index.html';
    filterConfig.enable = [
        'student-answer',
        'student-exer-grade',
        'answer-heatmap',
    ];
    filterConfig.filter = {};
    filterConfig.filter['student-answer'] = {
        title: '选择题答案分布',
        required: [
            ['qno', '题号'],
        ],
        optional: [
            ['v', '展现方式', 'pie'],
        ],
        parseUrl: function(data) {
            var url = '{baseUrl}?v={v}'.replaceInFormat({
                baseUrl: filterConfig.baseUrl,
                v: data.v[0]
            });
            for (var i in data.qno) {
                var qno = data.qno[i];
                url += '&data=data.QuestionAnswerConsumer/{qno}.stat.json'.replaceInFormat({
                    qno: qno,
                });
            }
            return url;
        },
    };
    filterConfig.filter['answer-heatmap'] = {
        title: '回答频率分布',
        optional: [
            ['v', '展现方式', 'heatmap'],
        ],
        parseUrl: function(data) {
            var datapath = 'data.StudentAnswerHeatmapConsumer/answerheatmap.stat.json'
            var url = '{baseUrl}?data={datapath}&v={v}'.replaceInFormat({
                baseUrl: filterConfig.baseUrl,
                datapath: datapath,
                v: data.v[0]
            });
            return url;
        }
    }
    filterConfig.filter['student-exer-grade'] = {
        title: '学生练习成绩分布',
        required: [
            ['email', '学生的注册邮箱'],
        ],
        optional: [
            ['compare', '是否和平均成绩比较', 'false'],
            ['v', '展现方式', 'polar'],
        ],
        parseUrl: function(data) {
            var url = '{baseUrl}?v={v}'.replaceInFormat({
                baseUrl: filterConfig.baseUrl,
                v: data.v[0]
            });
            if (data.compare[0] == 'true') {
                url += '&data=data.SectionScoreConsumer/all.sections.stat.json';
            }
            for (var i in data.email) {
                var email = data.email[i];
                url += '&data=data.SectionScoreConsumer/{email}.sections.stat.json'.replaceInFormat({
                    email: email,
                });
            }
            return url;
        }
    }

    function getChartsInfo() {
        var url = window.location.search;
        var args = {};
        if (url.indexOf('?') != -1) {
            var str = url.substr(1);
            var arglist = str.split('&');
            for (var i in arglist) {
                argstr = arglist[i];
                if (argstr != null & argstr != '') {
                    var key = argstr.split('=')[0];
                    var value = argstr.split('=')[1];
                    if (args[key] == undefined) {
                        args[key] = [];
                    }
                    args[key].push(unescape(value));
                }
            }
        }
        return args;
    }

    function loadChartFromUrlData(data) {
        if (data == null) return;
        if (data.type == null) return;
        var filter = filterConfig.filter[data.type[0]];
        var url = filter.parseUrl(data);
        $(element).find('iframe').attr('src', url);
    }

    $(function($) {
        for (var i in filterConfig.enable) {
            var filter = filterConfig.filter[filterConfig.enable[i]];
            // 渲染类型选择框
            $(element).find('.class-select').append(
                '<option value="{value}">{name}</option>'.replaceInFormat({
                    value: filterConfig.enable[i],
                    name: filter.title,
                })
            );
        }

        var data = getChartsInfo();
        loadChartFromUrlData(data);
    });

    $(element).on('change', '.class-select', function(e) {
        var type = $(e.target).val();
        var filter = filterConfig.filter[type];

        $(element).find('.form-panel').hide(200);
        $(element).find('.form-panel').empty();

        if (filter == undefined) {
            console.info('filter undefined')
            return;
        }

        // 渲染必填数据
        for (var j in filter.required) {
            inputItem = filter.required[j];
            $(element).find('.form-panel').append(
                '<div class="required-input-group">\
                    <label>\
                        <span class="label">{label}:</span>\
                        <input name="{name}" type="text" class="input"/>\
                    </label>\
                </div>'.replaceInFormat({
                    label: inputItem[1],
                    name: inputItem[0],
                })
            );
        }

        // 渲染选填数据
        for (var j in filter.optional) {
            inputItem = filter.optional[j];
            $(element).find('.form-panel').append(
                '<div class="optional-input-group">\
                    <label>\
                        <span class="label">{label}:</span>\
                        <input name="{name}" value="{value}" type="text" class="input"/>\
                    </label>\
                </div>'.replaceInFormat({
                    label: inputItem[1],
                    name: inputItem[0],
                    value: inputItem[2],
                })
            );
        }

        // 渲染载入按钮
        $(element).find('.form-panel').append(
            '<button class="load-charts">Load</button>'
        );

        $(element).find('.form-panel').show(200);
    });

    $(element).on('click', '.load-charts', function(e) {
        var enableType = $(element).find('.class-select').val();
        var data = {};
        $(element).find('.form-panel').find('input').each(function() {
            var name = $(this).attr('name');
            var value = $(this).val();
            if (value == '')
                return;
            data[name] = value.split(',');
        });
        var filter = filterConfig.filter[enableType];
        var url = filter.parseUrl(data);

        $(element).find('iframe').attr('src', url);
    });
}
