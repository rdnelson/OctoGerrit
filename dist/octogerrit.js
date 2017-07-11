(function (root) {

  root.octogerrit = {
    version: '1.0.2'
  };

  var head = document.getElementsByTagName('head')[0],
    link = document.createElement('link'),
    script = document.createElement('script'),
    callbacks = [];

  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css';
  link.media = 'all';

  script.id = 'jQuery';
  script.src = 'https://code.jquery.com/jquery-2.2.1.min.js';

  head.appendChild(link);
  head.appendChild(script);

  root.gerritReady = function gerritReady (callback) {
    callbacks.push(callback);
  };

  root.onload = function () {

    var old = root.gerrit_ui.__moduleStartupDone;

    root.gerrit_ui.__moduleStartupDone = function () {
      old.apply(old, arguments);

      // select the target node
      var target = document.querySelector('span.rpcStatus');

      // create an observer instance
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {

          var value = root.getComputedStyle(target).getPropertyValue('display');

          if (value === 'none') {
            // the last rpc operation is done, fire the ready handlers.
            for (var i = 0; i < callbacks.length; i++) {
              callbacks[i]();
            }
          }
        });
      });

      // configuration of the observer:
      var config = { attributes: true, attributeFilter: ['style'] };

      // pass in the target node, as well as the observer options
      observer.observe(target, config);
    };
  };

})(window);

(function (root) {

  var gerritGlyphs = {
      x: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB8ElEQVR42p2Sb0/TUBTGiYlJ41cwkcXwRq5mUdQ36LqKsDlQJ8rY//8MZGyjrNlSmKv6QhM/id9qMSESxK3KoN262z3ezhhdtkrgJCc5ycnv3PM8505MnDOQy12xb5bLk6hWiV2/m1gjnWi0pAfCLht4F/2KDIgiGYUTpJPKoruxibb/5ef24osbIzDq79BnaYoSuvk8GYITafQKJaBWh1WrHl8JinLp9wBF4fqiZPZ33wAfP8GUa+i93oK18gCOp2BsFQHW1xMp/Fh4QjEzc3lYQlLhaL5ITakKvP8AWq6gk85CjyVhbBYAeW9Qq/Ne2nC7ufEmJpNcN5OjvcI2k/MW2KszsAZUZejRONTHHnv43yFaOGZCZnIicSAYAaQK1LkF80zYinYoQfRIDLCuEQgBr1aB7R2m24vm7Cw5Aw4RLRyFkV0HdiQGloEik8MM1FdW0XrI48DpJPZwKAIjk2P/QIIWDKMlzNHvD1zmyVM/sL6B02d+HN29j4PpaTIKM61Geo29KkJjq7fcjwaGWXl45x49nvcA6QxOvD4c3nLiy7Wpv0Pay8vCaSAII5WBthJEkxeG3G443NxXcpP+5AVoviV8c97G/tVJYWgL1bMoHC89R9PFj3W74XBw+9en6Fj4TxzxvPC/Uw2G2MEXjV//kEpgRFM89AAAAABJRU5ErkJggg==',
      check: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABh0lEQVR42tXS2y+CYRwH8O7QX+Gif4DQgSyzMU2sdJCORBLvzGbppLeDV4uF95LJIWQzpyEXzOaydBp/g/knxNebrTbMlu58r5/P9/d79jws1r+LKial5VEJWTUmLs2YODNCQnc4/4QVO7301MUIVh8DoJIumOJqtFN8d2V4q5e2nZsQyfuxnCcxfDgIMSWAmBTXlg9N3hg7rdfase94gMHFlZdyJMI57+dkUYBX+IJtt/o2y7XuxXlPwHCsnC7jqIS2nhoQzs4jlPXAeKBCm7/lG74xdlkS2ufFlBORnA9DcVlBuds3LdvsWR4/0WEx4wGVdkK/r0Ar2fwVFzNzpKwzn2tgv5vE2tMCqJQLtgsTiCszgikHAmkHdHsDEJJNbz9wKZZLKZuZDCJh/rxnKOOG/8EOf8qOoZgcQm/T+6+4FOm6lC3b6MHosRaBhzl4k7PQ7MggmOcyuL62oucqlnSviJmVFVBv94Pvaawcl0t8XLYoyAPP3fDKITg1VX1ZLlNSNf5rPgAuk8WI5dcaoQAAAABJRU5ErkJggg=='
    },
    counter = 0,
    interval;

  gerritReady(function () {
    counter = 0;

    interval = setInterval(function (){
      var rows = document.querySelectorAll('.changeTable tbody tr'),
      tds;

      counter++;

      if (rows.length < 8 || counter > 5) {
        return;
      }

      clearInterval(interval);

      tds = document.querySelectorAll('td.cSTATUS');

      [].forEach.call(tds, function (td) {
        if (td.innerText === 'Merge Conflict') {
          td.className += ' gerrit-status-conflict';
        }
        else if (td.innerText === 'Merged') {
          td.className += ' gerrit-status-merged';
        }
        else if (td.innerText === 'Abandoned') {
          td.className += ' gerrit-status-abandoned';
        }
      });

      $('td.cSIZE').each(function () {
        var e = $(this),
        blocks = $('<div/>', { 'class': 'gerrit-size'}),
        block = $('<span/>', { 'class': 'gerrit-size-block'}),
        title = e.attr('title'),
        regex = /\+(\d+), \-(\d+)/,
        additions = parseInt(title.replace(regex, '$1')),
        removals = parseInt(title.replace(regex, '$2')),
        difference,
        adds = additions,
        rems = removals;

        if (adds + rems > 5) {
          difference = (rems + adds) / 5; // we prefer to only show 5 blocks, round up

          adds = Math.round(adds / difference);
          rems = Math.round(rems / difference);

          if (rems >= 5 ) {
            adds = 0;
          }
          else if (adds >= 5) {
            rems = 0;
          }
        }

        for(var i = 0; i < 5; i++) {
          var clone = block.clone();

          if (i < adds + rems) {
            clone.addClass('gerrit-size-block-' + (i < adds ? 'add' : 'rem'));
          }

          blocks.append(clone);
        }

        e.empty().append(blocks);
      });

      $('td.cAPPROVAL').each(function () {
        var e = $(this),
        index = e.index(),
        img = e.find('img'),
        state = 'none';

        if(e.find('div.gerrit-state').length) {
          return;
        }

        if (img.length) {
          if (img.attr('src').indexOf(gerritGlyphs.x) === 0) {
            state = 'minus-two';

            e.attr('title', index === 11 ? 'Build Failure' : '-2');
          }
          else if (img.attr('src').indexOf(gerritGlyphs.check) === 0) {
            state = 'plus-two';

            e.attr('title', index === 11 ? 'Verified' : '+2');
          }
        }
        else {
          if (e.text() === '-1') {
            state = 'minus-one';
            e.attr('title', '-1');
          }
          else if (e.text() === '+1') {
            state = 'plus-one';
            e.attr('title', '+1');
          }
        }

        e.empty()
        .append($('<div/>', { 'class': 'gerrit-state gerrit-state-' + state}));
      });
    }, 100);
  });

})(window);

(function (root) {

  gerritReady(function () {

    $('table.com-google-gerrit-client-change-ChangeScreen_BinderImpl_GenCss_style-labels td:nth-child(2)').each(function () {
      var e = $(this),
        stateTd = $('<td/>', { 'class': 'gerrit-review-state' });

      e.before(stateTd);
      e.find('> div > span')
      .appendTo(stateTd)
      .children().appendTo(e.find('> div'));
    });

    $('table.com-google-gerrit-client-change-ChangeScreen_BinderImpl_GenCss_style-labels td.gerrit-review-state span').each(function () {
      var e = $(this),
        text = e.text().trim(),
        state = 'none';

      if (text === '-2') {
        state = 'minus-two';
      }
      else if (text === '-1') {
        state = 'minus-one';
      }
      else if (text === '+2') {
        state = 'plus-two';
      }
      else if (text === '+1') {
        state = 'plus-one';
      }

      e.empty()
        .append($('<div/>', { 'class': 'gerrit-state gerrit-state-' + state}));

      e.parent()
        .addClass('gerrit-state-' + state)
        .parent().prev()
        .addClass('gerrit-state-' + state);
    });

    $('td.com-google-gerrit-client-change-FileTable-FileTableCss-commentColumn').each(function () {
      var e = $(this);
      e.html(e.html().replace('comments: ', ''));
    });

    $('td.com-google-gerrit-client-change-FileTable-FileTableCss-deltaColumn2').each(function () {
      var e = $(this),
        title = e.attr('title');

      if (!title) {
        return;
      }

      var blocks = $('<div/>', { 'class': 'gerrit-size'}),
        block = $('<span/>', { 'class': 'gerrit-size-block'}),
        regex = /(\d+) inserted, (\d+) deleted/,
        additions = parseInt(title.replace(regex, '$1')),
        removals = parseInt(title.replace(regex, '$2')),
        difference,
        adds = additions,
        rems = removals;

      if (adds + rems > 5) {
        difference = (rems + adds) / 5; // we prefer to only show 5 blocks, round up

        adds = Math.round(adds / difference);
        rems = Math.round(rems / difference);

        if (rems >= 5 ) {
          adds = 0;
        }
        else if (adds >= 5) {
          rems = 0;
        }
      }

      for(var i = 0; i < 5; i++) {
        var clone = block.clone();

        if (i < adds + rems) {
          clone.addClass('gerrit-size-block-' + (i < adds ? 'add' : 'rem'));
        }

        blocks.append(clone);
      }

      e.empty().append(blocks);
    });

  });

})(window);
