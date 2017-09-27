document.addEventListener 'DOMContentLoaded', ->
  #
  # init description icons
  #

  $('i.field-description').popup {
    hoverable: true
    position: "right center"
  }

  #
  # handle clone field blocks
  #

  $form = $('form')

  # hide removal from first list entry
  $('.uk-sortable').each -> $(this).find('.clone-remove:first').hide()

  formSubmit = ($anchor, tokenPrefix) ->
    $('#' + $anchor.data('block')).val(tokenPrefix + '-' + $anchor.data('token'))
    $form.submit()

  triggerClone = ($anchor) -> formSubmit $anchor, 'a'
  triggerRemoval = ($anchor) -> formSubmit $anchor, 'r'

  $('.clone-block').click (e) -> triggerClone $(this)
  $('.clone-remove').click (e) -> triggerRemoval $(this)