class MedicalGeometryBox {
    static draw_rect = (canvasId, x, y, w, h, color, auto_clear, is_dash) => {
        auto_clear = (auto_clear == undefined)?true:auto_clear;
        is_dash = (is_dash == undefined)?true:is_dash;
        var stage = new createjs.Stage(canvasId);    
        stage.autoClear = auto_clear;
        var rect = new createjs.Shape();
        color = (typeof color == "undefined") ? "#ffff00" : color;
        //rect.graphics.beginStroke("#ffffff").setStrokeStyle(3).drawRect(x, y, w, h);
        // https://www.createjs.com/docs/easeljs/classes/Graphics.html#method_setStrokeStyle
        if (is_dash) {
            rect.graphics.beginStroke(color).setStrokeDash([7, 5], 0)
                .setStrokeStyle(2).drawRect(x, y, w, h);
        } else {
            rect.graphics.beginStroke(color)
                .setStrokeStyle(2).drawRect(x, y, w, h);
        }
        
        stage.addChild(rect);
        stage.update();
    }

    static draw_brush = (canvasId, x, y, radius, color) => {
        var stage = new createjs.Stage(canvasId);    
        var brush = new createjs.Shape();
        color = (typeof color == "undefined") ? "#ffff00" : color;
        brush.graphics.setStrokeStyle(2)
            .beginStroke(color)
            .drawCircle(x, y, radius);
        stage.addChild(brush);
        stage.update();
    }
}

export default MedicalGeometryBox