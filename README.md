# mooc-ChartsBrowser
操作系统openedx的 XBlock，负责浏览统计图表。

## 部署方法
安装XBlock:
```
$ sudo -u edxapp /edx/bin/pip.edxapp install yourXBlock/
```

重启Edx服务器：
```
$ sudo /edx/bin/supervisorctl -c /edx/etc/supervisord.conf restart edxapp:
```
