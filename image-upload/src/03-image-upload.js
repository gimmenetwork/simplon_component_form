/*
 * All glory belongs to Joel Vardy. I put these things together
 * and only added the data-uri handling. Thanks Joel!
 *
 * See: https://github.com/joelvardy/javascript-image-upload
 */
(function ($) {
    $.fn.imageUpload = function () {
        var resize = new window.resize();
        resize.init();

        // ------------------------------------------

        var helper = {
            dataURLtoBlob: function (dataURL) {
                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString;

                if (dataURL.split(',')[0].indexOf('base64') >= 0) {
                    byteString = atob(dataURL.split(',')[1]);
                }
                else {
                    byteString = unescape(dataURL.split(',')[1]);
                }

                // separate out the mime component
                var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

                // write the bytes of the string to a typed array
                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ia], {type: mimeString});
            },

            fileSize: function (size) {
                var i = Math.floor(Math.log(size) / Math.log(1024));
                return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
            },

            setThumbnail: function ($container, removeLabel, downloadLabel, resizedOriginal, thumbnail) {
                var $thumbnailImageContainer = $('<div class="form-image-upload-thumbnail"><div class="menu-overlay"><a href="#" class="remove-anchor"><i class="remove large icon"></i>' + removeLabel + '</a><a href="' + resizedOriginal + '" class="download-anchor" target="_blank"><i class="download large icon"></i>' + downloadLabel + '</a></div><img src=""></div></div>');

                if (!thumbnail) {
                    thumbnail = resizedOriginal;
                }

                $thumbnailImageContainer.find('img').attr('src', thumbnail);

                $container.empty().append($thumbnailImageContainer);
            },

            setButtonLabel: function ($button, label) {
                $button.find('span').text(label);
            }
        };

        // ------------------------------------------

        return this.each(function () {
            var $that = $(this).parent();
            var $button = $that.find('.button');
            var $inputFile = $that.find('input[type=file]');
            var $textareaImage = $that.find('textarea');

            var imageQuality = parseFloat($that.data('image-quality'));
            var imageResizeToWidth = $that.data('image-width');
            var thumbnailResizeToWidth = $that.data('thumb-width');
            var $thumbnailContainer = $('#' + $that.data('thumb-container'));
            var attachLabel = $that.data('attach-label');
            var replaceLabel = $that.data('replace-label');
            var removeLabel = $that.data('remove-label');
            var downloadLabel = $that.data('download-label');
            var isNoThumbContainer = $that.data('no-thumb-container');
            var $noThumbnailContainer = null;

            if (isNoThumbContainer === 1) {
                $thumbnailContainer.before(
                    $('<div id="' + $that.data('thumb-container').replace('#', '').replace('.', '') + '-no-thumb" class="form-image-upload-no-thumbnail"></div>')
                );

                $noThumbnailContainer = $($that.data('thumb-container') + '-no-thumb');
            }

            if ($textareaImage.val() !== '') {
                helper.setThumbnail($thumbnailContainer, removeLabel, downloadLabel, $textareaImage.val());
            }
            else if ($noThumbnailContainer) {
                $noThumbnailContainer.css('display', 'block');
            }

            $thumbnailContainer.on('click', 'a.remove-anchor', function (event) {
                event.preventDefault();
                $thumbnailContainer.empty();
                helper.setButtonLabel($button, attachLabel);
                $textareaImage.val('');

                if ($noThumbnailContainer) {
                    $noThumbnailContainer.css('display', 'block');
                }
            });

            $button.on('click', function (event) {
                event.preventDefault();
                $inputFile.click();
            });

            $that.on('change', 'input[type=file]', function (event) {
                event.preventDefault();

                var files = event.target.files;

                if (files.length > 0) {
                    $button.toggleClass('loading');
                }

                for (var i in files) {
                    if (typeof files[i] !== 'object') {
                        return false;
                    }

                    (function () {
                        resize.photo(files[i], imageResizeToWidth, 'dataURL', imageQuality, function (resizedImageOriginal) {
                            $textareaImage.val(resizedImageOriginal);
                            helper.setButtonLabel($button, replaceLabel);

                            if ($button.hasClass('red')) {
                                $button.removeClass('red').addClass('basic');
                            }

                            //
                            // create thumbnail
                            //

                            resize.photo(helper.dataURLtoBlob(resizedImageOriginal), thumbnailResizeToWidth, 'dataURL', 1.0, function (resizedImageThumb) {
                                if ($noThumbnailContainer) {
                                    $noThumbnailContainer.css('display', 'none');
                                }

                                helper.setThumbnail($thumbnailContainer, removeLabel, downloadLabel, resizedImageOriginal, resizedImageThumb);

                                $button.toggleClass('loading');
                            });
                        });
                    }());
                }
            });
        });
    };
}(jQuery));