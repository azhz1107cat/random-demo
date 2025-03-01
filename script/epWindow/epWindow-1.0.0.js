/*  epWindow.js
 *  enhancedPageWindow v1.0.0 (c) 
 *  author zhz
 *  follow MIT
 *  import jQuery before use it
 */

class Simplewindow{

    constructor(w_title="",w_content="",bgcolor="white"){

        this.windowBG = $("<div></div>");
        this.windowBody = $("<div></div>");

        this.windowHeader = $("<div></div>");
        this.windowMain = $("<div></div>");
        this.windowFooter = $("<div></div>");
    
        this.windowTitle = $("<span></span>");
        this.windowCancle = $("<button></button>");

        this.windowTitle.html(w_title);
        this.windowMain.html(w_content);

        this.windowTitle.appendTo( this.windowHeader  );
        this.windowCancle.appendTo( this.windowHeader );

        this.windowCancle.html("<i></i>关闭窗口")

        this.windowHeader.appendTo( this.windowBody );
        this.windowMain.appendTo( this.windowBody );
        this.windowFooter.appendTo( this.windowBody );
        this.windowBG.addClass('window-bg');
        this.windowBody.addClass('window-body');
        this.windowBG.css("display","flex");
        this.windowBody.css("background-color",bgcolor);
        this.windowBody.appendTo( this.windowBG );

        
        this.windowCancle.on("click", (event) => {
            $(event.currentTarget).parent().parent().parent().remove();
        });


        this.show = () => {
            this.windowBG.appendTo("body");
        }
    }
}

class WindowWithYesNO extends Simplewindow{
    constructor(w_title="",w_content="",bgcolor="white"){
        super(w_title,w_content,bgcolor);
        this.certain = false;
        this.windowCancle.on("click",(event) => {
             this.certain = false ;
        });

        this.yesBtn = $("<button>确定</button>");
        this.noBtn = $("<button>取消</button>");


        this.yesBtn.appendTo( this.windowFooter );
        this.noBtn.appendTo( this.windowFooter );

        this.yesBtn.on("click" , (event) => {
            this.certain = true;
            $(event.currentTarget).parent().parent().parent().remove();
        })
    
        this.noBtn.on("click" , (event) => {
            this.certain = false;
            $(event.currentTarget).parent().parent().parent().remove();
        })
    }

}


class TextareaBox extends WindowWithYesNO{
    constructor(w_title="",w_content="",bgcolor="white", textarea_value=""){
        super(w_title,w_content,bgcolor);
        this.inputElement = $("<textarea></textarea>");
this.inputElement.css("width","200px");
this.inputElement.css("height","300px");
        this.inputElement.val( textarea_value );
        this.inputElement.appendTo(this.windowMain);

        this.yesBtn.on("click" , (event) => {
            this.value = this.inputElement.text();
            $(event.currentTarget).parent().parent().parent().remove();
        })
    
        this.noBtn.on("click" , (event) => {
            this.value = null;
            $(event.currentTarget).parent().parent().parent().remove();
        })
    }
}



function page_infoWindow(w_title,w_content){
    let _infoWindow = new Simplewindow(w_title,w_content);
    _infoWindow.show();
}

//含异步操作
function page_askWindow(title, content, color = "") {
    return new Promise((resolve) => {
        let _askWindow = new WindowWithYesNO(title, content, color);
        _askWindow.show();

        const handleClose = () => {
            resolve(_askWindow.certain);
        };

        _askWindow.yesBtn.on("click", handleClose);
        _askWindow.noBtn.on("click", handleClose);
        _askWindow.windowCancle.on("click", handleClose);
    });
}

function page_textareaBox(title="", content="", color = "", input_value = "") {
    return new Promise((resolve) => {
        let _inputBox = new TextareaBox(title, content, color, input_value);
        _inputBox.show();

        const handleClose = () => {
            resolve(_inputBox.value);
        };

        _inputBox.yesBtn.on("click", handleClose);
        _inputBox.noBtn.on("click", handleClose);
        _inputBox.windowCancle.on("click", handleClose);
    });
}


