$(function(){

setTimeout(
  function() {
    // Super-super hacky
    // Wait for 3 seconds until (we hope) angular renders page
    // then do hide/show jquery stuff
    // Let's do this in a much more elegant way, OK?
    $('.mumo-node').hide();
    $('.mumo-preview').hide();
    $('.mumo-expand').click(function() {
        $(this).next('ul.mumo-node').toggle();
        $(this).next('div.mumo-preview').toggle();
      }  
    );
  }, 3000);
});