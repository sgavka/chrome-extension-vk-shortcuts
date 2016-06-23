var $$vk = {
    pageTypes: {
        feed: {
            news: 'feed_news',
            updates: 'feed_updates',
            comments: 'feed_comments'
        },
        media: {
            photo: 'media_photo',
            wall: 'media_wall'
        }
    },
    __type: null,
    getType: function () {
        if ($$vk.__type !== null)
            return $$vk.__type;

        if (window.location.pathname.indexOf('/feed') == 0) {
            if (window.location.search.length !== 0) {
                var search = window.location.search.slice(1);
                var searchObj = $.deparam(search);

                if (searchObj.hasOwnProperty('w')) {
                    $$vk.__type = $$vk.pageTypes.media.wall;
                } else if (searchObj.hasOwnProperty('z')) {
                    $$vk.__type = $$vk.pageTypes.media.photo;
                } else {
                    if (searchObj.hasOwnProperty('section')) {
                        switch (searchObj['section']) {
                            case 'updates':
                                $$vk.__type = $$vk.pageTypes.feed.updates;
                                break;
                            case 'comments':
                                $$vk.__type = $$vk.pageTypes.feed.comments;
                                break;
                            default:
                                $$vk.__type = $$vk.pageTypes.feed.news;
                        }
                    } else {
                        $$vk.__type = $$vk.pageTypes.feed.news;
                    }
                }
            } else {
                $$vk.__type = $$vk.pageTypes.feed.news;
            }
        }

        return $$vk.__type;
    },
    getTypeRe: function () {
        $$vk.__type = null;

        return $$vk.getType();
    },
    __pageBody: null,
    actions: {
        types: {
            actionNext: 'next',
            actionPrev: 'prev',
            actionLike: 'like'
        },
        keyGroups: {
            j: [106, 74, 1086, 1054],
            k: [107, 75, 1083, 1051],
            l: [108, 76, 1076, 1044]
        },
        keyGroupToAction: {
            j: 'actionNext',
            k: 'actionPrev',
            l: 'actionLike'
        },
        indentKeyGroup: function (key) {
            var keyGroups = $$vk.actions.keyGroups;
            var group = null;

            $.each(keyGroups, function(k, v) {
                if ($.inArray(key, v) > -1) {
                    group = k;
                }
            });

            return group;
        },
        init: function () {
            $(document).keypress(function (event) {
                var actions = $$vk.actions;
                var keyGroup = actions.indentKeyGroup(event.which);

                var pageType = $$vk.getType();
                var pageTypes = $$vk.pageTypes;

                var action = $$vk.actions.keyGroupToAction[keyGroup];

                switch (pageType) { // todo: automate this for each action
                    case pageTypes.feed.news:
                        if ($$vk.pages.feed.pages.news.actions.hasOwnProperty(action) &&
                            $.isFunction($$vk.pages.feed.pages.news.actions[action])) {
                            $$vk.pages.feed.pages.news.actions[action]();
                        }
                        break;
                    default:
                        break;
                }
            });
        }
    },
    pages: {
        feed: {
            pages: {
                news: {
                    getPostsContainer: function () {
                        return $("#feed_rows");
                    },
                    getPosts: function () {
                        var newsPage = $$vk.pages.feed.pages.news;

                        return newsPage.getPostsContainer().find(".feed_row");
                    },
                    getFeedNewPosts: function () {
                        return $("#feed_new_posts");
                    },
                    isAdsFeedRow: function (feedRow) {
                        console.log(feedRow);
                        return $(feedRow)[0].firstChild.id == 'ads_feed_placeholder';
                    },
                    getFirstPost: function () { // todo: refactor -- function don`t return anything
                        var newsPage = $$vk.pages.feed.pages.news;

                        newsPage.setCurrentPost(newsPage.getPosts()[0]);
                    },
                    __currentPost: null,
                    setCurrentPost: function (post) {
                        this.__currentPost = post;
                    },
                    getCurrentPost: function () {
                        var newsPage = $$vk.pages.feed.pages.news;

                        if (newsPage.__currentPost === null) {
                            newsPage.getFirstPost();
                        }

                        return newsPage.__currentPost;
                    },
                    getNextPost: function () {
                        var newsPage = $$vk.pages.feed.pages.news;
                        var currentPost = newsPage.getCurrentPost();

                        if (currentPost.nextElementSibling !== null) {
                            currentPost = currentPost.nextElementSibling;

                            if (newsPage.isAdsFeedRow(currentPost)) {
                                currentPost = currentPost.nextElementSibling; // todo: possible error then it ads post is last
                            }

                            newsPage.setCurrentPost(currentPost);

                            return newsPage.getCurrentPost();
                        } else {
                            return false;
                        }
                    },
                    getPrevPost: function () {
                        var newsPage = $$vk.pages.feed.pages.news;
                        var currentPost = newsPage.getCurrentPost();

                        if (currentPost.previousElementSibling !== null
                            && $(currentPost.previousElementSibling).style == undefined) {
                            currentPost = currentPost.previousElementSibling;

                            if (newsPage.isAdsFeedRow(currentPost)) {
                                currentPost = currentPost.previousElementSibling;
                            }

                            newsPage.setCurrentPost(currentPost);

                            return newsPage.getCurrentPost();
                        } else {
                            console.log("Prev post not exists");

                            if ($(newsPage.getFeedNewPosts()[0]).innerHTML != undefined) {
                                console.log("Get more posts");

                                newsPage.getFeedNewPosts().click();

                                return newsPage.getPrevPost(); // todo: check if it`s not inf loop
                            } else {
                                return false;
                            }
                        }
                    },
                    scrollTo: function (element, time) {
                        $('html, body').animate({
                            scrollTop: $(element).offset().top
                        }, time);
                    },
                    actions: {
                        actionNext: function () {
                            console.log('page feed news next post');

                            var newsPage = $$vk.pages.feed.pages.news;

                            if (newsPage.getNextPost() !== false) {
                                newsPage.scrollTo(newsPage.getCurrentPost(), 400);
                            } else {
                                console.log("Next post not exists");
                            }
                        },
                        actionPrev: function () {
                            console.log('page feed news prev post');

                            var newsPage = $$vk.pages.feed.pages.news;

                            if (newsPage.getPrevPost() !== false) {
                                newsPage.scrollTo(newsPage.getCurrentPost(), 400);
                            } else {
                                console.log("Prev post not exists");
                            }
                        },
                        actionLike: function () {
                            console.log('page feed news like post');

                            var newsPage = $$vk.pages.feed.pages.news;

                            $(newsPage.getCurrentPost()).find('.post_like')[0].click();
                        }
                    },
                    init: function () {
                        $$vk.pages.feed.init();
                    },
                    _after: function () {
                        var newsPage = $$vk.pages.feed.pages.news;

                        newsPage.setCurrentPost(null);
                    }
                }
            },
            actions: {
                actionNext: function () {

                },
                actionPrev: function () {

                },
                actionLike: function () {

                }
            },
            init: function () {

            }
        }
    },
    init: function () {
        document.addEventListener("DOMSubtreeModified", function() {
            var oldType = $$vk.getType();
            console.log('Type: ' + oldType);

            switch ($$vk.getTypeRe()) {
                case $$vk.pageTypes.feed.news:
                    $$vk.pages.feed.pages.news.init();
                    break;
                default:
                    break;
            }

            console.log('New Type: ' + $$vk.getType());

            if (oldType === $$vk.pageTypes.feed.news && $$vk.getType() !== $$vk.pageTypes.feed.news) { // todo: automate this for each page
                $$vk.pages.feed.pages.news._after();
            }

            console.log('DOMSubtreeModified event:', window.location, $$vk.getType());
        });

        $$vk.actions.init();

        /*document.addEventListener("click", function() {
            console.log('click event:', window.location);
        });*/
    }
};

$$vk.init();