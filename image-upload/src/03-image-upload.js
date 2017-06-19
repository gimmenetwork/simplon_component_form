/*
 * All glory belongs to Joel Vardy. I simply put all these things together
 * so that it works in a more abstract way. Thanks Joel!
 *
 * See: https://github.com/joelvardy/javascript-image-upload
 */
(function ($)
{
    $.fn.imageUpload = function (options)
    {
        var defaultSettings = {
            getUrlResponseObject: function(response)
            {
                return response.url;
            }
        };

        var settings = $.extend(defaultSettings, options);

        var resize = new window.resize();
        resize.init();

        // ------------------------------------------

        var helper = {
            upload: function (urlUploadScript, photo, metaData, callback)
            {
                var formData = new FormData();
                formData.append('photo', photo);
                formData.append('meta', metaData);

                var request = new XMLHttpRequest();

                request.onreadystatechange = function ()
                {
                    if (request.readyState === 4)
                    {
                        callback(request.response);
                    }
                };

                request.open('POST', urlUploadScript);
                request.responseType = 'json';
                request.send(formData);
            },

            dataURLtoBlob: function (dataURL)
            {
                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString;

                if (dataURL.split(',')[0].indexOf('base64') >= 0)
                {
                    byteString = atob(dataURL.split(',')[1]);
                }
                else
                {
                    byteString = unescape(dataURL.split(',')[1]);
                }

                // separate out the mime component
                var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

                // write the bytes of the string to a typed array
                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++)
                {
                    ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ia], {type: mimeString});
            },

            fileSize: function (size)
            {
                var i = Math.floor(Math.log(size) / Math.log(1024));
                return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
            },

            setThumbnail: function ($container, thumbnail, removeLabel, downloadLabel)
            {
                var $thumbnailImageContainer = $('<div class="form-image-upload-thumbnail"><div class="menu-overlay"><a href="#" class="remove-anchor"><i class="remove large icon"></i>' + removeLabel + '</a><a href="' + thumbnail + '" class="download-anchor" target="_blank"><i class="download large icon"></i>' + downloadLabel + '</a></div><img src=""></div></div>');
                $thumbnailImageContainer.find('img').attr('src', thumbnail);

                $container.empty().append($thumbnailImageContainer);
            },

            setButtonLabel: function ($button, label)
            {
                $button.find('span').text(label);
            }
        };

        // ------------------------------------------

        return this.each(function ()
        {
            //console.log('Binding image upload...', $(this));

            var $that = $(this).parent();
            var $button = $that.find('.button');
            var $inputFile = $that.find('input[type=file]');
            var $inputImage = $that.find('input[type=hidden]');

            var urlUploadScript = $that.data('upload-url');
            var uploadMetaData = $that.data('upload-meta-data') || null;
            var imageResizeToWidth = $that.data('image-width');
            var thumbnailResizeToWidth = $that.data('thumb-width');
            var $thumbnailContainer = $($that.data('thumb-container'));
            var attachLabel = $that.data('attach-label');
            var replaceLabel = $that.data('replace-label');
            var removeLabel = $that.data('remove-label');
            var downloadLabel = $that.data('download-label');
            var isNoThumbContainer = $that.data('no-thumb-container');
            var $noThumbnailContainer = null;

            if(isNoThumbContainer === 1)
            {
                $thumbnailContainer.before(
                    $('<div id="' + $that.data('thumb-container').replace('#', '').replace('.', '') + '-no-thumb" class="form-image-upload-no-thumbnail"></div>')
                );

                $noThumbnailContainer = $($that.data('thumb-container') + '-no-thumb');
            }

            if ($inputImage.val() !== '')
            {
                helper.setThumbnail($thumbnailContainer, $inputImage.val(), removeLabel, downloadLabel);
            }
            else if($noThumbnailContainer)
            {
                $noThumbnailContainer.css('display', 'block');
            }

            $thumbnailContainer.find('a.remove-anchor').on('click', function (event)
            {
                event.preventDefault();
                $thumbnailContainer.empty();
                helper.setButtonLabel($button, attachLabel);
                $inputImage.val('');

                if($noThumbnailContainer)
                {
                    $noThumbnailContainer.css('display', 'block');
                }
            });

            $button.on('click', function (event)
            {
                event.preventDefault();
                $inputFile.click();
            });

            $inputFile.on('change', function (event)
            {
                event.preventDefault();

                var files = event.target.files;

                if (files.length > 0)
                {
                    //console.log('Form Image Upload: starting upload...');
                    $button.toggleClass('loading');
                }

                for (var i in files)
                {
                    if (typeof files[i] !== 'object')
                    {
                        return false;
                    }

                    (function ()
                    {
                        var initialSize = files[i].size;

                        resize.photo(files[i], imageResizeToWidth, 'file', function (resizedImage)
                        {
                            var resizedSize = resizedImage.size;

                            // upload image to defined URL
                            helper.upload(urlUploadScript, resizedImage, uploadMetaData, function (response)
                            {
                                //console.log('Form Image Upload: successfully uploaded.', 'Image URL: ', response.url);

                                $inputImage.val(settings.getUrlResponseObject(response));
                                helper.setButtonLabel($button, replaceLabel);

                                if ($button.hasClass('red'))
                                {
                                    $button.removeClass('red').addClass('basic');
                                }

                                // create thumbnail and put it through as dataURL
                                resize.photo(resizedImage, thumbnailResizeToWidth, 'dataURL', function (resizedImage)
                                {
                                    //console.log('Form Image Upload: set thumbnail as dataURL', resizedImage);

                                    if($noThumbnailContainer)
                                    {
                                        $noThumbnailContainer.css('display', 'none');
                                    }

                                    helper.setThumbnail($thumbnailContainer, resizedImage, removeLabel);

                                    $button.toggleClass('loading');
                                });
                            });
                        });
                    }());
                }
            });
        });
    };
}(jQuery));