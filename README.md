## 功能简介

让textarea成为极简的markdown编辑器

支持自定义快捷键

## 使用

```
<script src="/path/xMarkdown.js"></script>
<script>
var md = xMarkdown.create('#editor');

// 获取数据
md.value();

// 重置数据
md.value('重新插入的数据');

// 获取焦点
md.focus();

// 失去焦点
md.blur();

// 在光标处插入字符 如有选中字符将进行替换
md.insert('要插入或替换的文本');

// 获取先中文本
md.selectionText();

// 获取光标信息
var cursor = md.cursor();

// cursor.text 当前光标所在行文本
// cursor.line 当前光标所在行序号
// cursor.lines textarea所有行数组
// cursor.start 选中区域开始位置
// cursor.end 选中区域结束位置

// 编辑状态
md.enable(true || false);

// 执行自定义方法
// @name 方法名
// @code 文本数据 可选
// @args 附加参数 可选
md.action(name , code , args);

md.action('bold'); // 加粗 Ctrl-B
md.action('italic'); // 斜体 Ctrl-I
md.action('link'); // 链接 Ctrl-K

// 支持 bold,italic,link,image,list,underline,code,codeblock,table,header,quote等
// 可以通过 xMarkdown.action自由扩展或修改原有功能

</script>
```