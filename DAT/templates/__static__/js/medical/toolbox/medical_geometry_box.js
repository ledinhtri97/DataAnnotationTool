class MedicalGeometryBox {
    static draw_rect = (canvasId, x, y, w, h, color) => {
        var stage = new createjs.Stage(canvasId);    
        var rect = new createjs.Shape();
        color = (typeof color == "undefined") ? "#ffff00" : color;
        //rect.graphics.beginStroke("#ffffff").setStrokeStyle(3).drawRect(x, y, w, h);
        // https://www.createjs.com/docs/easeljs/classes/Graphics.html#method_setStrokeStyle
        rect.graphics.beginStroke(color).setStrokeDash([7, 5], 0)
            .setStrokeStyle(2).drawRect(x, y, w, h);
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