/*
 * All glory belongs to Joel Vardy. I simply put all these things together
 * so that it works in a more abstract way. Thanks Joel!
 *
 * See: https://github.com/joelvardy/javascript-image-upload
 */
window.resize = (function ()
{
    'use strict';

    function Resize()
    {
    }

    Resize.prototype = {

        init: function (outputQuality)
        {
            this.outputQuality = (outputQuality === 'undefined' ? 0.8 : outputQuality);
        },

        photo: function (file, maxSize, outputType, callback, forcedMimeType)
        {
            var _this = this;
            var reader = new FileReader();

            reader.onload = function (readerEvent)
            {
                var readerMimeType = new FileReader();

                readerMimeType.onload = function(e)
                {
                    var mimeType;
                    var header = "";
                    var arr = (new Uint8Array(e.target.result)).subarray(0, 4);

                    for(var i = 0; i < arr.length; i++)
                    {
                        header += arr[i].toString(16);
                    }

                    switch (header)
                    {
                        case "89504e47":
                            mimeType = "image/png";
                            break;
                        case "47494638":
                            mimeType = "image/gif";
                            break;
                        case "ffd8ffe0":
                        case "ffd8ffe1":
                        case "ffd8ffe2":
                            mimeType = "image/jpeg";
                            break;
                        default:
                            mimeType = file.type; // Or you can use the blob.type as fallback
                            break;
                    }

                    if(forcedMimeType)
                    {
                        mimeType = forcedMimeType;
                    }

                    _this.resize(readerEvent.target.result, mimeType, maxSize, outputType, callback);
                };

                readerMimeType.readAsArrayBuffer(file)
            };

            reader.readAsDataURL(file);
        },

        resize: function (dataURL, mimeType, maxSize, outputType, callback)
        {
            var _this = this;
            var image = new Image();

            image.onload = function (imageEvent)
            {
                // Resize image
                var canvas = document.createElement('canvas'),
                    width = image.width,
                    height = image.height;

                if (width > height)
                {
                    if (width > maxSize)
                    {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                }
                else
                {
                    if (height > maxSize)
                    {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);

                _this.output(canvas, mimeType, outputType, callback);
            };

            image.src = dataURL;
        },

        output: function (canvas, mimeType, outputType, callback)
        {
            switch (outputType)
            {
                case 'file':
                    canvas.toBlob(function (blob) { callback(blob); }, mimeType, 0.8);
                    break;

                case 'dataURL':
                    callback(canvas.toDataURL(mimeType, 0.8));
                    break;
            }
        }
    };

    return Resize;
}());