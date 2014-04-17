/**
 * Related posts for Blogger Widget
 *
 * @author gaerae
 * @version 1.0
 */
(function($, document){
    /**
     * 위젯 선택자
     * @type String
     * @final
     */
    var HELPER_NAMESPACE = $('div.related-posts-widget');

    /**
     * 현재 페이지 주소
     * @type String
     * @private
     */
    var CURRENT_URL;

    /**
     * 기본 옵션 정의
     * @type Object
     * @static
     */
    var OPTION = {
            blog_url: '',
            max_posts: 5,
            max_tags: 5,
            posts_per_tag: 5,
            title_use: true,
            thumb_use: true,
            thumb_default: '',
            thumb_size: 's72-c',
            tags: false,
            post_page_only: false,
            url_querystring: false,
            panel_title_related: 'Related Posts',
            panel_title_recent: 'Recent Posts',
            loading_class: '-related-posts-loading'
    }

    /**
     * 관련 게시글 표시
     * @class RelatedPosts
     * @static
     */
    var RelatedPosts = {
        /**
         * 활성화
         * @method enable
         */
        enable: function() {
            RelatedPosts.onOption();
            RelatedPosts.onFeed();
        },

        /**
         * 위젯 선택자 및 옵션 확인
         * @method getOptions
         */
        onOption: function() {
            var _content, _option;
            // 위젯 및 옵션 확인
            if (HELPER_NAMESPACE) {
                var _content = HELPER_NAMESPACE.html().replace(/\n|\r\n/g, '');
                if ((_content = _content.match(/<!--\s*(\{.+\});?\s*--\>/)) && _content.length == 2) _content = _content[1];
                if (_content) {
                    if (_content.indexOf('{') < 0) _content = '{' + _content + '}';
                    try {
                        _option = eval('(' + _content + ')')
                     } catch (message) {
                        HELPER_NAMESPACE.html('<b style="color:red">' + message + '</b>');
                        return false;
                    }
                    OPTION = $.extend(OPTION, _option);
                }
            }
            // 현재 주소 확인
            if (OPTION.post_page_only ? location.pathname.match(/^\/\d{4}\/\d\d\/[\w\-\_]+\.html/) : true) {
                CURRENT_URL = location.protocol + '//' + location.host + location.pathname + (OPTION.url_querystring ? location.search : '');
            }
        },

        /**
         * 게시글 가져오기
         * @method getPosts
         */
        onFeed: function() {
            var _tag, _feed_url = OPTION.blog_url + '/feeds/posts/summary/';
            if (!OPTION.tags) {
                OPTION.tags = [];
                $('a[rel="tag"]:lt(' + OPTION.max_tags + ')').each(function () {
                    _tag = $.trim($(this).text().replace(/\n/g,''));
                    if ($.inArray(_tag, OPTION.tags) == -1) OPTION.tags[OPTION.tags.length] = _tag;
                });
            }
            if (OPTION.tags.length == 0) {
                $.ajax({
                    url: _feed_url,
                    data: {
                        'max-results': OPTION.max_posts,
                        alt: 'json-in-script'
                    },
                    success: RelatedPosts.onContent,
                    dataType: 'jsonp',
                    cache: true
                })
            } else {
                for (var i = 0, o = OPTION.tags.length; i < o; i++) {
                    $.ajax({
                        url: _feed_url,
                        data: {
                            category: OPTION.tags[i],
                            'max-results': OPTION.posts_per_tag,
                            alt: 'json-in-script'
                        },
                        success: RelatedPosts.onContent,
                        dataType: 'jsonp',
                        cache: true
                    });
                }
            }
        },

        /**
         * 관련 게시글 출력
         * @method getPosts
         */
        onContent: function (d) {
            var _panel_title, _list_group, _title, _link, _thumbnail, _entry_length = d.feed.entry.length;
            if (d.feed.entry) {
                _panel_title = (OPTION.tags.length == 0 ? OPTION.panel_title_recent : OPTION.panel_title_related);
                _list_group = '<div class="panel panel-primary"><div class="panel-heading"><h3 class="panel-title">'+ _panel_title +'</h3></div>';
                _list_group += '<div class="panel-body '+ OPTION.loading_class +'">';

                for (var _entry_loop = 0; _entry_loop < _entry_length; _entry_loop++) {
                    // 링크 주소
                    var _entry = d.feed.entry[_entry_loop];
                    _link_find: {
                        var _link_loop = 0, _link_length = _entry.link.length;
                        for (_link_length; _link_loop < _link_length; _link_loop++) {
                            if (_entry.link[_link_loop].rel == 'alternate') {
                                _link = _entry.link[_link_loop].href;
                                break _link_find;
                            }
                        }
                    }
                    // 타이틀
                    _title = _entry.title.$t;

                    // 썸네일 이미지
                    _thumbnail = _entry.media$thumbnail ? _entry.media$thumbnail.url : OPTION.thumb_default;
                    if (OPTION.thumb_size != 's72-c') _thumbnail = _thumbnail.replace('/s72-c/', '/' + OPTION.thumb_size + '/');

                    // 현재 페이지 게시글 제외
                    if (_link != CURRENT_URL || OPTION.tags.length == 0) {
                        _list_group += '<div class="col-xs-6 col-md-2"><a href="'+ _link +'" class="thumbnail">' + (OPTION.thumb_use && _thumbnail ? '<img src="' + _thumbnail + '" title="' + (OPTION.title_use ? '' : _title) + '" border="0"/>' : '') + (OPTION.title_use ? _title : '') + '</a></div>';
                    }
                }
                _list_group += '</div></div>';
                HELPER_NAMESPACE.html(_list_group);
            }
        }
    };

    // 관련 게시글 활성화
    $(document).ready(RelatedPosts.enable);
}(jQuery, document));