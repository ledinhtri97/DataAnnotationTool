class MedicalImageProcessingBox {
    static fit = (cvmat, canvas_width, canvas_height) => {
        // re-calculate final_scale
        var final_scale = 1.0;
        const scale_by_width = canvas_width / cvmat.cols;
        const scale_by_height = canvas_height / cvmat.rows;
        if (cvmat.cols*scale_by_width <= canvas_width && cvmat.rows*scale_by_width <= canvas_height) {
            final_scale = scale_by_width;
        } else {
            final_scale = scale_by_height;
        }
        if (final_scale != 1.0) {
            let dsize = new cv.Size(cvmat.cols*final_scale, cvmat.rows*final_scale);
            cv.resize(cvmat, cvmat, dsize, 0, 0, cv.INTER_AREA);
        }
        return cvmat;
    }

    static ROI = (cvmat, x_min, y_min, x_max, y_max) => {
        var xmin = x_min; 
        var ymin = y_min; 
        var xmax = x_max; 
        var ymax = y_max;
        if (xmin != 0 || ymin != 0 || xmax != 1 || ymax != 1) {
            // adjust
            if (xmax < xmin) {
                var tmp = xmin;
                xmin = xmax;
                xmax = tmp;
            }
    
            if (ymax < ymin) {
                var tmp = ymin;
                ymin = ymax;
                ymax = tmp;
            }
            
            xmin = (xmin<0)?0:xmin;
            ymin = (ymin<0)?0:ymin;
            xmax = (xmax>1)?1:xmax;
            ymax = (ymax>1)?1:ymax;
    
            // crop by xmin, ymin, xmax, ymax
            let rect = new cv.Rect(xmin*cvmat.cols, 
                ymin*cvmat.rows, 
                xmax*cvmat.cols-xmin*cvmat.cols, 
                ymax*cvmat.rows-ymin*cvmat.rows);
            cvmat = cvmat.roi(rect);
        }
        return cvmat;
    }
}

export default MedicalImageProcessingBox;