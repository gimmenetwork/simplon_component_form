var typeaheadElement = {
    getHiddenField: function ($that)
    {
        return $that.parent().parent().find('input[type=hidden]');
    },
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
            var $hiddenField = typeaheadElement.getHiddenField($(this));

            if ($hiddenField)
            {
                var value = typeaheadElement.getValue(item, displayAttr);
                var id = typeaheadElement.getValue(item, idAttr);

                if (id)
                {
                    value = id + delimiter + value;
                }

                $hiddenField.val(value);
            }
        };
    },
    close: function (e)
    {
        var $that = $(this);
        var $hiddenField = typeaheadElement.getHiddenField($that);

        if ($that.val() !== '' && $hiddenField.val() === '')
        {
            $that.val('');
        }
        else if ($that.val() === '' && $hiddenField.val() !== '')
        {
            $hiddenField.val('');
        }
    }
};