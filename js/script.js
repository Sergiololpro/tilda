let vue = new Vue({
    el: '#vue',
    data: {
        // slug: "lenkom",
        // host: "lencom.me",
        // api: "https://lencom.me/api/v1/",
        // slug: "mht_im_a_p_chehova",
        // host: "mxat-theatre.com",
        // api: "https://mxat-theatre.com/api/v1/",
        slug: "krokus_siti_holl",
        host: "crocus-holl.com",
        api: "https://crocus-holl.com/api/v1/",
        // slug: "radisson_royal",
        // host: "radissontickets.com",
        // api: "https://radissontickets.com/api/v1/",
        // slug: "moskovskij_planetarij",
        // host: "planetariym.com",
        // api: "https://planetariym.com/api/v1/",
        // slug: "besprintsypnye-chtenija",
        // slug_event: "besprintsypnye-chtenija",
        // host: "dev.doorway.sys-tix.com",
        // api: "https://dev.doorway.sys-tix.com/api/v1/",
        yandex: 92990926,
        mail_ru: 3318007,
        title_text: " | Ленком",
        map_view: "scheme",
        info_text: "",
        info_color: "#4db483",
        // tilda_widget_id: "pk_e40712c97f8fbd9f2c223a2c20b51",
        tilda_widget_deescription: "Описание к оплате",
        show_map_switch: true,

        loading: false,
        seances: [],
        months: [],
        activeMonth: "",
        navMonth: "",
        nextMonth: "",
        staticMonths: [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ],
        staticMonthsDat: [ 'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря' ],
        week: [ 'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ],
        week_short: [ 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб' ],
        event_id: window.location.hash ? window.location.hash.substring(1) : "",
        seance_event_id: window.location.hash ? window.location.hash.substring(1).split('&')[0] : "",
        seance_seance_id: window.location.hash ? window.location.hash.substring(1).split('&')[1] : "",
        event_data: [],
        seance_data: [],
        seance_list: false,
        hall_map: "",
        cart: [],
        cart_summ: 0,
        window_is_sector: false,
        window_sector: "",
        window_row: "",
        window_seat: "",
        window_price: "",
        mobile_cart: true,
        order_loading: false,
        list_tickets: {},
        list_map: "",
        list_loaded: false,
        scheme_loaded: false,
        show_list_map: false,
        m_tickets: [],
        m_sector: "",
        legend_range: [],
        page_content: [],
        page_text: "",
        text_page: $("#vue").data("text_page") ? $("#vue").data("text_page") : "",
        iframe: "",
        sold_modal_staus: false,
        sold_modal_link: "/",
        sold_modal_ids: [],
        sold_modal_tickets: [],
        cache_requests: new Map(),
    },
    mounted: function() {
        this.touchCart();

        if ($(".afisha").length) {
            this.takeSeances();
        }

        if ($(".event").length) {
            this.takeEvent();
        }

        if ($(".seance").length) {
            const slf = this;

            this.takeSeance();

            $("body").on("mouseenter", "path.act, circle.act", function(event){
                const self = event.target;
            
                if ($(this).data("seat") != -1) {
                    slf.hoveredNumber(
                        $(this).data("id"),
                        $(this).data("s"),
                        $(this).data("c"),
                        parseInt($(this).attr('cx')),
                        parseInt($(this).attr('cy')),
                        $(this).attr('transform'),
                        $(this).data("color")
                    );

                    if (self.classList.contains('sel')) {
                        $('text[data-text="' + $(self).attr('data-id') + '"]').show();
                    }
                }
            });

            $("body").on("click", "path.act:not(.m_t), circle.act:not(.m_t), .list__input", function(){
                let id = $(this).data("id"),
                    sector = $(this).data("sn"),
                    row = $(this).data("r"),
                    seat = $(this).data("s"),
                    price = $(this).data("p"),
                    title = $(".seance_top__title").data("title"),
                    location = $(".seance").data("location"),
                    date = $(".date_data").data("date"),
                    index = slf.cart.findIndex(obj => obj.id === id);

                if ( index >= 0) {
                    slf.cart.splice(index, 1);

                    $('[data-id="' + $(this).data("id") + '"]').removeClass("sell");
                } else {
                    let cartItem = {
                        id: id,
                        sector: sector,
                        row: row,
                        seat: seat,
                        price: price,
                        title: title,
                        location: location,
                        date: date,
                        seance_id: slf.seance_seance_id,
                        event_id: slf.seance_event_id,
                        count: 1
                    };

                    slf.cart.push(cartItem);

                    if (typeof VK !== 'undefined') {
                        VK.Goal('add_to_cart');
                    }

                    if (self.yandex && typeof ym !== 'undefined') {
                        ym(self.yandex, 'reachGoal', 'add_to_card');
                    }

                    if (self.mail_ru && typeof _tmr !== 'undefined') {
                        _tmr.push({ type: 'reachGoal', id: self.mail_ru, goal: 'add_to_card'});
                    }

                    $('[data-id="' + $(this).data("id") + '"]').addClass("sell");
                }

                localStorage.setItem("cart", JSON.stringify(slf.cart));

                slf.touchCart();
            });

            addEventListener('mousemove', slf.tellPos, false);
            
            $("body").on("mouseenter", "svg .act, svg .active_sector", function(event, triggered, touchTriggered){
                if ($(this).hasClass("active_sector")) {
                    slf.window_is_sector = true;
                    slf.window_sector = $(this).data("sn");
                    slf.window_price = $(this).data("p");

                    this.classList.add('hovered');
                } else {
                    slf.window_is_sector = false;
                    slf.window_sector = $(this).data("sn");
                    slf.window_row = $(this).data("r");
                    slf.window_seat = $(this).data("s");
                    slf.window_price = $(this).data("p");

                    $('[data-id="' + $(this).data("id") + '"]').addClass("hovered");
                }
                
                slf.tellPos(event);
                
                $(".seance_window").addClass("active");
            });

            $("body").on("mouseleave", "svg .act, svg .active_sector", function (event, triggered) {
                if ($(this).hasClass("active_sector")) {
                    this.classList.remove('hovered');
                } else {
                    $('[data-id="' + $(this).data("id") + '"]').removeClass("hovered"); 
                }
                
                $(".seance_window").removeClass("active");
            });

            $("body").on("click", ".active_sector", function(){
                if ($(this).data("ss") !== undefined) {
                    slf.m_sector = $(this).data("ss");
                } else {
                    slf.m_sector = $(this).find("circle").data("ss");
                }
            });
        }

        if ($(".text_page").length) {
            this.takeText();
        }
    },
    computed: {
        seancesGroups: function() {
            if ( this.seances.length == 0 )
                return {};
            return this.seances.reduce(function (r, a) {
                r[a.date] = r[a.date] || [];
                r[a.date].push(a);
                return r;
            }, Object.create(null));
        },
        eventGroups: function() {
            if ( this.event_data == 0 )
                return {};
            return this.event_data.seances.reduce(function (r, a) {
                r[a.starts_at] = r[a.starts_at] || [];
                r[a.starts_at].push(a);
                return r;
            }, Object.create(null));
        },
        seanceDay: function() {
            return function(date) {
                return date.split("T")[0].split("-")[2];
            }
        },
        seanceMonth: function() {
            const self = this;

            return function(date) {
                return self.staticMonthsDat[new Date(date).getMonth()];
            }
        },
        seanceD: function() {
            return function(date) {
                return new Date(date).getDay();
            }
        },
        seanceWeek: function() {
            const self = this;

            return function(date) {
                return self.week[new Date(date).getDay()];
            }
        },
        seanceWeekShort: function() {
            const self = this;

            return function(date) {
                return self.week_short[new Date(date).getDay()];
            }
        },
        seanceHour: function() {
            return function(date) {
                return new Date(date).getUTCHours() + ":" + ('0' + new Date(date).getMinutes()).slice(-2);
            }
        },
        seanceHour2: function() {
            return function(date) {
                return new Date(date).getHours() + ":" + ('0' + new Date(date).getMinutes()).slice(-2);
            }
        },
        seanceImage: function() {
            return function(seance) {
                return "background-image: url(" + seance.image + ");";
            }
        },
        eventImage: function() {
            return function(event) {
                const row = event.preview_header ? event.preview_header : event.image;
                return "background-image: url(https://" + this.host + row + ");";
            }
        },
        eventPhoto: function() {
            return function(photo) {
                return "background-image: url(https://" + this.host + photo.photo_opt + ");";
            }
        },
        filterMonth: function() {
            const self = this;

            return function(month) {
                return self.staticMonths[parseInt(month.split("-")[1]) - 1];
            }
        },
        filterYear: function() {
            return function(month) {
                return parseInt(month.split("-")[0]);
            }
        },
        groupTickets: function() {
            const self = this;
            
            return Object.values(self.cart).reduce(function(rv, x) {
                (rv[x["seance_id"]] = rv[x["seance_id"]] || []).push(x);
                return rv;
              }, {});
        },
        textPageTitle: function() {
            const self = this;
            
            return self.page_content.seo_title ? self.page_content.seo_title : self.page_content.banner_title
        },
    },
    methods:{
        async takeinfoFromCache(url, data) {
            const self = this,
                row = (new URLSearchParams(data)).toString();

            if (!self.cache_requests.has(row)) {
                const response = await axios.get(url, {
                    params: data
                });

                const content = await response.data;

                self.cache_requests.set(row, content);
            }

            return self.cache_requests.get(row);  
        },
        async takeSeances(month, append) {
            const self = this;

            self.loading = true;

            if (month) {
                self.activeMonth = self.navMonth = month;
                self.nextMonth = self.months[self.months.indexOf(month) + 1];
            }

            const data = {
                host_name: self.host,
                place_slug: self.slug,
                month: self.activeMonth
            };

            const response = await self.takeinfoFromCache(self.api + "events_tilda/", data);

            self.seances = append ? self.seances.concat(response.results) : response.results;
            self.loading = false;

            if (!self.months.length) {
                self.months = response.months;
                self.activeMonth = response.months[response.months.length - 1];
                self.nextMonth = self.months[self.months.indexOf(self.activeMonth) + 1];
                self.navMonth = response.months[0];
            }
        },

        takeEvent(month, append) {
            const self = this;

            self.loading = true;

            $.ajax({
                url: self.api + "event_tilda/",
                method: "GET",
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: {
                    host_name: self.host,
                    event_id: self.event_id,
                },
                success: function(response) {
                    console.log(response)

                    self.event_data = response;
                    self.loading = false;

                    document.title = "Купить билеты на " + self.event_data.title + self.title_text;
                }
            });
        },

        takeSeance() {
            const self = this;

            self.loading = true;

            $.ajax({
                url: self.api + "event_scheme_tilda/",
                method: "GET",
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: {
                    host_name: self.host,
                    event_id: self.seance_event_id,
                    seance_id:  self.seance_seance_id,
                },
                success: function(response) {
                    console.log(response)

                    self.seance_data = response;

                    document.title = "Купить билеты на " + self.seance_data.map_api_data.name + " - " + self.seance_data.hall_name + self.title_text;

                    if (self.seance_data.map_api_data.hall) {
                        self.hall_map = self.seance_data.map_api_data.hall.hall_map;
                        self.list_map = self.seance_data.map_api_data.hall.extended_hall_map || self.seance_data.map_api_data.hall.hall_map;
                    }


                    if (self.seance_data.hallmaps_settings && self.seance_data.hallmaps_settings[0] && self.seance_data.hallmaps_settings[0][3]) {
                        self.map_view = self.seance_data.hallmaps_settings[0][3];
                    }

                    if (self.hall_map) {
                        self.takeScheme();
                    } else {
                        if (self.seance_data.tickets) {
                            self.placeTickets();
                        }

                        self.map_view = "list";
                        self.show_map_switch = false;
                    }

                    self.placeList();
                }
            });
        },

        takeScheme() {
            const self = this;

            $.ajax({
                url: self.hall_map,
                method: "GET",
                success: function(response) {
                    $("#hall").html(response.querySelector('svg'));
                    self.init_scheme();
                }
            })
        },

        async init_scheme() {
            const self = this,
                window_width = ($(window).width() / 100) * 90,
                $scheme = document.querySelector('#hall > svg'),
                viewBox = $scheme.getAttribute('viewBox').split(' ');
  
            window.map = await L.map('hall', {
                crs: L.CRS.Simple,
                zoom: 1,
                minZoom: 0,
                maxZoom: 4,
                scrollWheelZoom: false,
            });
  
            let instant_width = parseInt(viewBox[2], 10),
                instant_height = parseInt(viewBox[3], 10),
                scale = window.innerWidth * .9 / instant_width;

            if (instant_height > instant_width) {
                scale = window.innerWidth * .9  / instant_height
            }
  
            let width = (window.innerWidth * .8 ),
                height = (window.innerHeight - 300);
  
            $('#hall').css('height', height + 100 + 'px');
  
            L.svgOverlay(
                '#hall > svg',
                [[0, 0], [(height), (width)]]
            ).addTo(map);
  
            $(".leaflet-control-zoom").stick_in_parent({
                parent: $('#hall'),
                offset_top: 120
            });
  
            map.fitBounds([[0, 0], [(height + 50), (width)]]);
            map.setMaxBounds([[0, 0], [(height + 50), (width)]]);
  
            const $svg = $('.leaflet-overlay-pane').find('svg'),
                $mapPane = $('.leaflet-map-pane');
  
            $('#hall').on('mousedown', function (e) {
                $svg.css('will-change', 'transform');
                $mapPane.css('will-change', 'transform');
            }).on('mouseup', function (e) {
                $svg.css('will-change', 'unset');
                $mapPane.css('will-change', 'unset');
            });

            self.scheme_loaded = true;
            self.loading = false;

            if (self.seance_data.tickets) {
                self.placeTickets();
            }
        },

        placeTickets() {
            const self = this;
            
            if (self.hall_map) {
                self.makeLegend();
            }

            self.seance_data.tickets.forEach((ticket) => {  
                if (ticket.ml) {
                    let m_ticket = ticket,
                        index = self.cart.findIndex(obj => obj.id === m_ticket.id),
                        seat_class = "act m_t",
                        color = "color_1";
          
                    if (index > -1) {
                        m_ticket.count = self.cart[index].count;
                    } else {
                        m_ticket.count = 0;
                    }

                    self.m_tickets.push(ticket);
                    // let sector = $("#hall").find("#" + ticket.ss + " > *")[0],
                    let sector = $("#hall").find("#" + ticket.ss)[0],
                        sector_wrp = $("#hall").find("#" + ticket.ss)[0];

                    if (sector) {
                        self.setAttributes(sector, {
                            'class': "active_sector",
                            'data-sn': ticket.sn,
                            'data-ss': ticket.ss,
                            'data-p': ticket.p,
                        });

                        let inner_els = sector_wrp.querySelectorAll('path, rect, polygon, polyline, circle');

                        if (ticket.p > self.legend_range[4]) {
                            color = "color_5";
                        } else if (ticket.p > self.legend_range[3]) {
                            color = "color_4";
                        } else if (ticket.p > self.legend_range[2]) {
                            color = "color_3";
                        } else if (ticket.p > self.legend_range[1]) {
                            color = "color_2";
                        } else {
                            color = "color_1"
                        }

                        if (self.cart.findIndex(obj => obj.id === ticket.id) >= 0) {
                            seat_class += " sell";
                        }

                        self.setMultiplyAttributes(inner_els, {
                            'class': seat_class,
                            'data-p': ticket.p,
                            'data-np': ticket.np,
                            'data-pp': ticket.pp,
                            'data-p_extra': ticket.p_extra,
                            'data-c_extra': ticket.c_extra,
                            'data-sn': ticket.sn,
                            'data-ss': ticket.ss,
                            'data-id': ticket.id,
                            'data-pr': ticket.pr,
                            'data-r': ticket.r,
                            'data-s': ticket.s,
                            'data-is_bintranet': ticket.is_bintranet,
                            'data-is_official': ticket.is_official,
                            'data-grid': ticket.grid,
                            'data-fee': ticket.fee,
                            'data-m': ticket.m,
                            'data-pro': ticket.pro,
                            'data-mid': ticket.mid,
                            'data-is_rival': ticket.is_rival,
                            'data-color': color
                        });
                    }
                    
                } else if (ticket.sn && ticket.scid && ticket.r && +ticket.r && !!ticket.r.replace(' ', '') && ticket.s !== "-" && +ticket.s) {
                    let place = $("#hall").find("#" + ticket.ss + " g:nth-child(" + ticket.r + ") path:nth-child(" + parseInt(ticket.s) + ")")[0],
                        seat_class = "act",
                        cicle = false,
                        color = "color_1";
                    
                    if (!place) {
                        place = $("#hall").find("#" + ticket.ss + " g:nth-child(" + ticket.r + ") circle:nth-child(" + parseInt(ticket.s) + ")")[0];
                        cicle = true;
                    }

                    if (place) {
                        if (ticket.p > self.legend_range[4]) {
                            color = "color_5";
                        } else if (ticket.p > self.legend_range[3]) {
                            color = "color_4";
                        } else if (ticket.p > self.legend_range[2]) {
                            color = "color_3";
                        } else if (ticket.p > self.legend_range[1]) {
                            color = "color_2";
                        } else {
                            color = "color_1"
                        }

                        if (self.cart.findIndex(obj => obj.id === ticket.id) >= 0) {
                            seat_class += " sell";

                            if (cicle) {
                                self.hoveredNumber(
                                    ticket.id,
                                    ticket.s,
                                    place.getAttribute('data-c'),
                                    parseInt(place.getAttribute('cx')),
                                    parseInt(place.getAttribute('cy')),
                                    place.getAttribute('transform'),
                                    color
                                );
                            }
                        }
    
                        self.setAttributes(place, {
                            'class': seat_class,
                            'data-p': ticket.p,
                            'data-np': ticket.np,
                            'data-pp': ticket.pp,
                            'data-p_extra': ticket.p_extra,
                            'data-c_extra': ticket.c_extra,
                            'data-sn': ticket.sn,
                            'data-id': ticket.id,
                            'data-pr': ticket.pr,
                            'data-r': ticket.r,
                            'data-s': ticket.s,
                            'data-is_bintranet': ticket.is_bintranet,
                            'data-is_official': ticket.is_official,
                            'data-grid': ticket.grid,
                            'data-fee': ticket.fee,
                            'data-m': ticket.m,
                            'data-pro': ticket.pro,
                            'data-mid': ticket.mid,
                            'data-is_rival': ticket.is_rival,
                            'data-color': color
                        });
                    }
                }
            });
        },

        makeLegend() {
            let self = this,
                tickets = self.seance_data.tickets.sort(function(a,b) {return a.p - b.p});
                length = tickets.length
                min_price = tickets[0].p,
                max_price = tickets[length - 1].p,
                self.legend_range[0] = min_price,
                self.legend_range[1] = Math.floor(min_price + ((max_price - min_price) * .1)),
                self.legend_range[2] = Math.floor(min_price + ((max_price - min_price) * .2)),
                self.legend_range[3] = Math.floor(min_price + ((max_price - min_price) * .3)),
                self.legend_range[4] = Math.floor(min_price + ((max_price - min_price) * .4));

                this.$forceUpdate();
        },

        legendToogle(index) {
            let id = index + 1;

            if (!$(".legend__el.active").length) {
                $("#hall .act, .map_place").addClass("price__off");
            }

            if ($(".legend__el:nth-child(" + id + ")").hasClass("active")) {
                $("#hall .act[data-color=color_" + id + "]").addClass("price__off");
            } else {
                $("#hall .act[data-color=color_" + id + "]").removeClass("price__off"); 
            }

            $(".legend__el:nth-child(" + id + ")").toggleClass("active");

            if ($(".legend__el.active").length == 0 || $(".legend__el.active").length == 5) {
                $(".legend__el").removeClass("active");
                $("#hall .act, .map_place").removeClass("price__off"); 
            }
        },

        setAttributes(el, attrs) {
            for (let key in attrs) {
                if (attrs[key]) el.setAttribute(key, attrs[key]);
            }
        },

        setMultiplyAttributes(elements, attrs) {
            elements.forEach((element) => {
              this.setAttributes(element, attrs);
            })
        },

        hoveredNumber(id, s, dc, cx, cy, tr, color) {
            if ($("#hall[data-text='" + id + "']").length > 0 || !s)
                return;
            let $text = document.createElementNS('http://www.w3.org/2000/svg', 'text'),
                tr_x = 0,
                tr_y = 0,
                left, 
                top, 
                font_size,
                radius = parseInt($("circle[data-id=" + id + "]").css("r")),
                left_1 = 3.4,
                top_1 = 3,
                font_size_1 = 7,
                left_2 = 3,
                top_2 = 2,
                font_size_2 = 4,
                left_3 = 1.6,
                left_4 = 7;

            s = s.toString();
                
            if (tr && tr.indexOf('rotate') < 0) {
                tr_x = parseInt(tr.slice(tr.indexOf('(') + 1, tr.indexOf(',')));
                tr_y = parseInt(tr.slice(tr.indexOf(',') + 1, tr.indexOf(')')));
            }

            if (radius >= 10) {
                left_1 = 5;
                left_2 = 5.5;
                left_3 = 2.5;

                top_1 = 3.5;
                top_2 = 2.5;

                font_size_1 = 10;
                font_size_2 = 7;
            }

            if (s.length > 1) {
                left = left_1;
                top = top_1;
                font_size = font_size_1;

                if (s.length > 2) {
                    left = left_2;
                    top = top_2;
                    font_size = font_size_2;

                    if (s.length > 3) {
                        left = left_4;
                    }
                }
            } else {
                left = left_3;
                top = top_1;
                font_size = font_size_1;
            }

            if (!isNaN(cx) && !isNaN(cy) && !isNaN(dc)) {
                $text.setAttribute('data-text', id);
                $text.setAttribute('class', "map_place map_place-" + dc);
                $text.setAttribute('x', cx + tr_x - left);
                $text.setAttribute('y', cy + tr_y + top);
                $text.setAttribute('style', 'font-size: ' + font_size + 'px;');
                $text.setAttribute('data-color', color);
                $text.innerHTML = s;

                let $check = document.createElementNS('http://www.w3.org/2000/svg', 'path');

                $check.setAttribute('data-path', id);
                $check.setAttribute('style', 'stroke-width: 2; fill: #000000; stroke: #000000; opacity: 1; pointer-events: none !important; display: none;');
                $check.setAttribute('transform', 'translate('+(cx-3)+', '+(cy-2)+') scale(0.65)');
                $check.setAttribute('d', "M10.5793 1.13952L3.7222 7.99666L0.579346 4.8538L1.38506 4.04809L3.7222 6.37952L9.77363 0.333801L10.5793 1.13952Z");

                $("#hall svg")[0].appendChild($text);
                $("#hall svg")[0].appendChild($check);
            }
        },
        touchCart() {
            const self = this;

            self.cart = [];

            if (localStorage.getItem("cart")) {
                self.cart = JSON.parse(localStorage.getItem("cart"));
            }

            self.cart_summ = 0;

            self.cart.forEach((ticket) => {
                self.cart_summ += ticket.price * ticket.count;
            })
        },
        clearCart() {
            localStorage.setItem("cart", "");
            $(".sell").removeClass("sell");

            this.m_tickets.forEach((ticket) => {  
                ticket.count = 0;
            });

            this.m_sector = '';

            this.touchCart();
        },
        tellPos(p) {
            let height = parseInt($(".seance_window").css("height")),
                width = parseInt($(".seance_window").css("max-width"));

            if (!p.clientX && !p.clientY && window.hoveredEm) {
                let bounds = window.hoveredEm.getBoundingClientRect();

                p.clientX = bounds.x + bounds.width / 2;
                p.clientY = bounds.y + bounds.height / 2;
            }

            $(".seance_window").css({
                left: p.clientX - width / 2,
                top: p.clientY - height - 20
            });
        },
        delTicket(id) {
            let index = this.cart.findIndex(obj => obj.id === id);

            this.cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(this.cart));

            this.touchCart();
        },
        changeUrl(link) {
            window.location.href = link;
            location.reload();
        },
        makeOrder() {
            let self = this,
                name = $('#order_form input[name="name"]').val(),
                phone = $('#order_form input[name="phone"]').val(),
                email = $('#order_form input[name="email"]').val(),
                comment = $('#order_form textarea[name="comment"]').val(),
                pay_type = $('#order_form input[name="pay_type"]').val(),
                agree = $("#agree").is(":checked"),
                error = false;

            $('.error').removeClass('error');

            if (!name) {
                $('#order_form input[name="name"]').parent().addClass('error');
                error = true;
            }

            if (!phone) {
                $('#order_form input[name="phone"]').parent().addClass('error');
                error = true;
            } 

            if (!email) {
                $('#order_form input[name="email"]').parent().addClass('error');
                error = true;
            }

            if (!agree) {
                $('#order_form input[name="agree"]').parent().addClass('error');
                error = true;
            }

            if (!error) {
                self.order_loading = true;

                const payment_link = self.tilda_widget_id ? "payment_info" : "payment_tilda";

                $.ajax({
                    url: self.api + payment_link + "/send/",
                    method: "POST",
                    data: {
                        host_name: self.host,
                        name: name,
                        phone: phone,
                        email: email,
                        comment: comment,
                        pay_type: pay_type,
                        tickets: self.cart,
                    },
                    success: function(response) {
                        console.log(response)
                        
                        if (response.success) {
                            if (self.tilda_widget_id) {
                                let widget = new cp.CloudPayments();

                                widget.pay('auth',
                                    {
                                        publicId: self.tilda_widget_id,
                                        description: self.tilda_widget_deescription,
                                        amount: self.cart_summ,
                                        currency: 'RUB',
                                        invoiceId: response.order_id,
                                        email: email,
                                        payer: { 
                                            firstName: name,
                                            phone: phone,
                                        }
                                    },
                                    {
                                        onSuccess: function () {
                                            setTimeout(function () {
                                                self.clearCart();

                                                window.location.href = "/order_success";
                                            }, 1000);
                                        },
                                        onFail: function () {
            
                                        }
                                    }
                                )
                            } else {
                               // window.location.href = response.message
    
                               self.iframe = response.message

                               self.clearCart();
    
                               $('html').animate({
                                   scrollTop: 0
                               }, 400);
                            }

                            if (typeof VK !== 'undefined') {
                                VK.Goal('conversion');
                            }

                            if (self.yandex && typeof ym !== 'undefined') {
                                ym(self.yandex, 'reachGoal', 'lead');
                            }

                            if (self.mail_ru && typeof _tmr !== 'undefined') {
                                _tmr.push({ type: 'reachGoal', id: self.mail_ru, goal: 'lead'});
                            }
                        } else {
                            self.clearCart();
                            self.sold_modal_ids = response.tikets_id;
                            self.soldModalShow();

                            self.clearCart();
                        }

                        self.order_loading = false;
                    }
                });
            }
        },
        m_ticket(ticket, plus) {
            let self = this,
                id = ticket.id,
                sector = ticket.sn,
                row = ticket.r,
                seat = ticket.s,
                price = ticket.p,
                qty = ticket.qty,
                title = $(".seance_top__title").data("title"),
                location = $(".seance").data("location"),
                date = $(".date_data").data("date"),
                index = self.cart.findIndex(obj => obj.id === id),
                m_index = self.m_tickets.findIndex(obj => obj.id === id),
                sell = true;

            if (index >= 0) {
                let count = self.cart[index].count;

                if (plus) {
                    count += 1;
                    self.cart[index].count = count;
                    self.m_tickets[m_index].count = count;
                } else {
                    if (count == 1) {
                        count = 0;
                        self.cart.splice(index, 1);
                        self.m_tickets[m_index].count = count;

                        sell = false;
                    } else {
                        count -= 1;
                        self.cart[index].count = count;
                        self.m_tickets[m_index].count = count;
                    }
                }
            } else {
                let cartItem = {
                    id: id,
                    sector: sector,
                    row: row,
                    seat: seat,
                    price: price,
                    title: title,
                    location: location,
                    date: date,
                    seance_id: self.seance_seance_id,
                    count: 1,
                    is_multipled: true,
                    qty: qty,
                };

                self.cart.push(cartItem);

                if (typeof VK !== 'undefined') {
                    VK.Goal('add_to_cart');
                }

                if (self.yandex && typeof ym !== 'undefined') {
                    ym(self.yandex, 'reachGoal', 'add_to_cart');
                }

                if (self.mail_ru && typeof _tmr !== 'undefined') {
                    _tmr.push({ type: 'reachGoal', id: self.mail_ru, goal: 'add_to_card'});
                }

                self.m_tickets[m_index].count = 1;
            }

            if (sell) {
                $('[data-id="' + id + '"]').addClass("sell");
            } else {
                $('[data-id="' + id + '"]').removeClass("sell");
            }

            localStorage.setItem("cart", JSON.stringify(self.cart));

            self.touchCart();
        },
        takeText() {
            const self = this;

            $.ajax({
                url: self.api + "page_tilda/",
                method: "GET",
                data: {
                    host_name: self.host,
                    page_slug: self.text_page
                },
                success: function(response) {
                    console.log(response)
                    self.page_content = response[0];

                    if (self.text_page == "about") {
                        self.page_text = self.page_content.about_text;
                    } else if (self.text_page == "guarantee") {
                        self.page_text = self.page_content.guarantee_text;
                    } else if (self.text_page == "delivery") {
                        self.page_text = self.page_content.delivery_text;
                    } else if (self.text_page == "offer") {
                        self.page_text = self.page_content.offer_text;
                    } else if (self.text_page == "payment") {
                        self.page_text = self.page_content.payment_text;
                    } else if (self.text_page == "confidential") {
                        self.page_text = self.page_content.text;
                    } else if (self.text_page == "contact") {
                        self.page_text = self.page_content.contact_text;
                    }
                }
            })
        },
        closeSoldModal() {
            this.sold_modal_staus = false;
        },
        placeList() {
            const self = this;

            self.seance_data.tickets.forEach((ticket) => {  
                if (ticket.ml) {
                    self.list_tickets[ticket.ss] = self.list_tickets[ticket.ss] || [];
                    self.list_tickets[ticket.ss].push(ticket);

                    self.list_tickets[ticket.ss]["ml"] = true;

                    self.list_tickets[ticket.ss]["count"] = self.list_tickets[ticket.ss]["count"] + ticket.qty || ticket.qty;
                } else {
                    self.list_tickets[ticket.ss] = self.list_tickets[ticket.ss] || [];
                    self.list_tickets[ticket.ss][ticket.r] = self.list_tickets[ticket.ss][ticket.r] || [];
                    self.list_tickets[ticket.ss][ticket.r].push(ticket);
                    
                    self.list_tickets[ticket.ss]["count"] = self.list_tickets[ticket.ss]["count"] + 1 || 1;

                    self.list_tickets[ticket.ss][ticket.r]["status"] = false;
    
                    if (!self.list_tickets[ticket.ss][ticket.r]["min_price"] || ticket.p < self.list_tickets[ticket.ss][ticket.r]["min_price"]) {
                        self.list_tickets[ticket.ss][ticket.r]["min_price"] = ticket.p;
                    }
                }

                self.list_tickets[ticket.ss]["title"] = ticket.sn;

                self.list_tickets[ticket.ss]["status"] = false;

                if (!self.list_tickets[ticket.ss]["min_price"] || ticket.p < self.list_tickets[ticket.ss]["min_price"]) {
                    self.list_tickets[ticket.ss]["min_price"] = ticket.p;
                }

                if (!self.list_tickets[ticket.ss]["max_price"] || ticket.p > self.list_tickets[ticket.ss]["max_price"]) {
                    self.list_tickets[ticket.ss]["max_price"] = ticket.p;
                }
            });

            console.log(self.list_tickets)

            for (const property in self.list_tickets) {
                for (const row in self.list_tickets[property]) {
                    if (!self.list_tickets[property]["ml"] && typeof self.list_tickets[property][row] === 'object') {
                        self.list_tickets[property][row].sort(function(a, b) {
                            return a.p - b.p || a.s - b.s;
                        });
                    }
                }
            }

            self.loading = false;
            self.list_loaded = true;
        },
        soldModalShow() {
            const self = this;

            self.sold_modal_ids.forEach((id) => { 
                self.cart.forEach((ticket) => { 
                    if (id == ticket.id) {
                        self.sold_modal_tickets.push(ticket.sector + ", ряд " + ticket.row + ", место " + ticket.seat);

                        self.sold_modal_link = "/seance#" + ticket.event_id + "&" + ticket.seance_id;
                    }
                });
            });

            self.sold_modal_staus = true;
        },
        toggleMapView(view) {
            this.map_view = view;
        },
        toggleSector(index) {
            this.list_tickets[index].status = !this.list_tickets[index].status;
            this.$forceUpdate();
        },
        toggleRow(index, id) {
            this.list_tickets[index][id].status = !this.list_tickets[index][id].status;
            this.$forceUpdate();
        },
    }
})