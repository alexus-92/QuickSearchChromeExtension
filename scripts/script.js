var seachers = [
    {
        "name" : "yandex",
        "iconStyle" : "iconYandex",
        "listurl" : "https://suggest.yandex.ru/suggest-ya.cgi?v=4&part=",
        "searchurl": "https://www.yandex.ru/search/?text="
    },
    {
        "name" : "google",
        "iconStyle" : "iconGoogle",
        "listurl" : "https://www.google.ru/complete/search?sclient=psy-ab&q=",
        "searchurl": "https://www.google.ru/search?q="
    }
];
var currentSearcherId = 0;
var selectedSuggest = -1;
var suggestMas = new Array();

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get("searcherId", function (obj) {
        if (obj.searcherId != null)
        {
            currentSearcherId = obj.searcherId;
            $('#searcher').val(currentSearcherId);
            ChangeSearcher(currentSearcherId);
        }
    });
    
    $('#suggestPanel').css('left', $('#query').offset().left);
    $('#query').focus();
});

$('#searcher').change(function(){
    ChangeSearcher($('#searcher').val());
});

function ChangeSearcher(id)
{
    selectedSuggest = -1;
    FillSuggestDiv([]);
    $('#icon').removeClass(seachers[currentSearcherId].iconStyle);
    $('#icon').addClass(seachers[id].iconStyle);
    currentSearcherId = id;
    chrome.storage.sync.set({'searcherId': currentSearcherId});
}

document.onkeyup = function (e) {
    e = e || window.event;
    if (e.keyCode === 13) {
        Search();
    }
    else if (e.keyCode === 40) {
        selectedSuggest++;
        if(selectedSuggest >= suggestMas.length)
            selectedSuggest = 0;
        $('#query').val(suggestMas[selectedSuggest]);
        
        $('.suggestEl').removeClass('selected');
        $('.suggestEl:eq(' + selectedSuggest + ')').addClass('selected');
    }
    else if (e.keyCode === 38) {
        selectedSuggest--;
        if(selectedSuggest < 0)
            selectedSuggest = suggestMas.length - 1;;
        $('#query').val(suggestMas[selectedSuggest]);
        
        $('.suggestEl').removeClass('selected');
        $('.suggestEl:eq(' + selectedSuggest + ')').addClass('selected');
    }
    else
    {
        $.get(
            seachers[currentSearcherId].listurl + $('#query').val(),
            onGetHelpListSuccess
        );    
    }

    return false;
}

function onGetHelpListSuccess(data)
{
    if(data.length != 3)
    {
        return;
    }
    
    suggestMas = new Array();
    suggestMas.push($('#query').val());
    for(var i = 0; i < data[1].length; i++)
    {
        if(data[1][i] instanceof Array)
            suggestMas.push(data[1][i][1 - currentSearcherId].replace('<b>', '').replace('</b>', ''));
        else
            suggestMas.push(data[1][i].replace('<b>', '').replace('</b>', ''));
    }
    
    FillSuggestDiv(suggestMas);
}

function FillSuggestDiv(mas)
{
    selectedSuggest = -1;
    var inner = "";
    for(var i = 0; i < mas.length; i++)
    {
        inner += '<div class="suggestEl">' + mas[i] + '</div>';
    }
    $('#suggestPanel').html(inner);
    
    $('body').css('height', $('#suggestPanel').offset().top + $('#suggestPanel').height());
    $('html').css('height', $('#suggestPanel').offset().top + $('#suggestPanel').height());
    
    $('.suggestEl').click(function(event){
        $('#query').val($(this).html());
        Search();
    });
}

function Search()
{
    window.open(seachers[currentSearcherId].searchurl + $('#query').val());
}