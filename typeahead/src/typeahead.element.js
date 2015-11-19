var typeaheadElement = {
    getValue: function (obj, attr)
    {
        var keys = attr.split('.');
        var cur = obj;

        for (var i = 0; i < keys.length; i++)
        {
            if (cur.hasOwnProperty(keys[i]))
            {
                cur = cur[keys[i]];
            }
        }

        return cur;
    },
    idle: function (e)
    {
        $(this).parent().parent().removeClass('loading');
    },
    active: function (e)
    {
        $(this).parent().parent().addClass('loading');
    },
    select: function (displayAttr, idAttr, delimiter)
    {
        return function (e, item)
        {
            var $hiddenField = $(this).parent().parent().find('input[type=hidden]');

            if ($hiddenField)
            {
                var id = typeaheadElement.getValue(item, idAttr);
                var value = typeaheadElement.getValue(item, displayAttr);
                var label = value;

                if (id)
                {
                    value = id + delimiter + value;
                }

                var $searchContainer = $(this).parent().parent().parent();
                var $singleResultContainer = $searchContainer.find('.single-result-container');
                var $multiResultContainer = $searchContainer.find('.multi-result-container');
                var template = '<div class="ui fluid selected-item"><a href="#" data-value="{value}"><i class="delete icon"></i></a>{label}</div>';

                if ($singleResultContainer.length)
                {
                    $hiddenField.val(value);

                    $singleResultContainer.empty().append(
                        $(template.replace('{value}', value).replace('{label}', label))
                    );

                    $searchContainer.addClass('has-single-result');
                }

                if ($multiResultContainer.length)
                {
                    if ($hiddenField.val() !== '')
                    {
                        $hiddenField.val($hiddenField.val() + ',');
                    }

                    $hiddenField.val($hiddenField.val() + value);

                    $multiResultContainer.append(
                        $(template.replace('{value}', value).replace('{label}', label))
                    );

                    $searchContainer.addClass('has-multi-result');
                }
            }
        };
    },
    removeResult: function (e)
    {
        e.preventDefault();

        var $that = $(this)
        var $fieldContainer = $(this).parent().parent().parent();
        var $hiddenField = $fieldContainer.find('input[type=hidden]');

        // remove value from hidden input
        $hiddenField.val($hiddenField.val().replace(new RegExp(',*' + $that.data('value')), ''));
        $hiddenField.val($hiddenField.val().replace(/^,/, ''));

        // handle indication for single-result-container
        $fieldContainer.removeClass('has-single-result');
        $fieldContainer.find('.single-result-container').empty();

        // remove selected-item container
        $that.parent().remove();
    },
    close: function (e)
    {
        $(this).typeahead('val', '');
    }
};