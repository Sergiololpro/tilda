let vue = new Vue({
    el: '#vue',
    data: {
        // slug: "lenkom",
        // host: "lencom.me",
        // api: "https://lencom.me/api/v1/",
        // slug: "mht_im_a_p_chehova",
        // host: "mxat-theatre.com",
        // api: "https://mxat-theatre.com/api/v1/",
        // slug: "krokus_siti_holl",
        // host: "crocus-holl.com",
        // api: "https://crocus-holl.com/api/v1/",
        // slug: "radisson_royal",
        // host: "radissontickets.com",
        // api: "https://radissontickets.com/api/v1/",
        // slug: "moskovskij_planetarij",
        // host: "planetariym.com",
        // api: "https://planetariym.com/api/v1/",
        slug: "besprintsypnye-chtenija",
        slug_event: "besprintsypnye-chtenija",
        host: "dev.doorway.sys-tix.com",
        api: "https://dev.doorway.sys-tix.com/api/v1/",
        yandex: "",
        mail_ru: "",
        title_text: " | Ленком",
        map_view: "scheme",
        info_text: "",
        info_color: "#4db483",
        tilda_widget_id: "pk_e40712c97f8fbd9f2c223a2c20b51",
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
        cart_count: 0,
        window_is_sector: false,
        window_sector: "",
        window_row: "",
        window_seat: "",
        window_price: "",
        mobile_cart: true,
        order_loading: false,
        list_tickets: {},
        list_map: "",
        show_list_map: false,
        m_tickets: [],
        m_sector: "",
        legend_range: [],
        page_content: [],
        page_text: "",
        text_page: document.getElementById('vue').dataset.text_page ? document.getElementById('vue').dataset.text_page : "",
        iframe: "",
        sold_modal_staus: false,
        sold_modal_link: "/",
        sold_modal_ids: [],
        sold_modal_tickets: [],
        cache_requests: new Map(),
    },
    mounted: function() {
        this.touchCart();

        if (document.querySelector(".afisha")) {
            this.takeSeances();
        }

        if (document.querySelector(".event")) {
            this.takeEvent();
        }

        if (document.querySelector(".seance")) {
            this.takeSeance();  
        }

        if (document.querySelector(".text_page")) {
            this.takeText();
        }
    },
    computed: {
        seancesGroups: function() {
            if (this.seances.length == 0) return {};

            return this.seances.reduce((grouped, seance) => {
                grouped[seance.date] = grouped[seance.date] || [];
                grouped[seance.date].push(seance);
                return grouped;
            }, Object.create(null));
        },
        eventGroups: function() {
            if (this.event_data == 0) return {};

            return this.event_data.seances.reduce((grouped, seance) => {
                grouped[seance.starts_at] = grouped[seance.starts_at] || [];
                grouped[seance.starts_at].push(seance);
                return grouped;
            }, Object.create(null));
        },
        seanceDay: function() {
            return (date) => date.split("T")[0].split("-")[2];
        },
        seanceMonth: function() {
            return (date) => this.staticMonthsDat[new Date(date).getMonth()];
        },
        seanceD: function() {
            return (date) => new Date(date).getDay();
        },
        seanceWeek: function() {
            return (date) => this.week[new Date(date).getDay()];
        },
        seanceWeekShort: function() {
            return (date) => this.week_short[new Date(date).getDay()];
        },
        seanceHour: function() {
            return (date) =>
                `${new Date(date).getUTCHours()}:${('0' + new Date(date).getMinutes()).slice(-2)}`;
        },
        seanceHour2: function() {
            return (date) =>
                `${new Date(date).getHours()}:${('0' + new Date(date).getMinutes()).slice(-2)}`;
        },
        seanceImage: function() {
            return (seance) => `background-image: url(${seance.image});`;
        },
        eventImage: function() {
            return (event) => {
                const row = event.preview_header ? event.preview_header : event.image;
                return `background-image: url(https://${this.host}${row});`;
            }
        },
        eventPhoto: function() {
            return (photo) => `background-image: url(https://${this.host}${photo.photo_opt});`;
        },
        filterMonth: function() {
            return (month) => this.staticMonths[parseInt(month.split("-")[1]) - 1];
        },
        filterYear: function() {
            return (month) => parseInt(month.split("-")[0]);
        },
        groupTickets: function() {            
            return Object.values(this.cart).reduce((groupedTickets, ticket) => {
                (groupedTickets[ticket["seance_id"]] = groupedTickets[ticket["seance_id"]] || []).push(ticket);
                return groupedTickets;
            }, {});
        },
        textPageTitle: function() {
            return this.page_content.seo_title ? this.page_content.seo_title : this.page_content.banner_title
        },
    },
    methods:{
        async takeinfoFromCache(url, searchParrams) {
            const row = JSON.stringify(searchParrams);

            if (!this.cache_requests.has(row)) {
                const response = await axios.get(url, {
                    params: searchParrams
                });

                const content = await response.data;

                console.log(content);

                this.cache_requests.set(row, content);
            }

            return this.cache_requests.get(row);  
        },
        async takeSeances(month, append) {
            let searchParrams = {
                host_name: this.host
            };

            this.loading = true;

            if (month) {
                this.activeMonth = this.navMonth = month;
                this.nextMonth = this.months[this.months.indexOf(month) + 1];
                searchParrams.month = this.activeMonth; 
            }

            if (this.slug_event) {
                searchParrams.slug_event = this.slug_event;
            } else {
                searchParrams.place_slug = this.slug; 
            }

            const response = await this.takeinfoFromCache(this.api + "events_tilda/", searchParrams);

            this.seances = append ? this.seances.concat(response.results) : response.results;
            this.loading = false;

            if (!this.months.length) {
                this.months = response.months;
                this.activeMonth = response.months[response.months.length - 1];
                this.nextMonth = this.months[this.months.indexOf(this.activeMonth) + 1];
                this.navMonth = response.months[0];
            }
        },

        async takeEvent() {
            this.loading = true;

            const response = await axios.get(`${this.api}event_tilda/`, {
                params: {
                    host_name: this.host,
                    event_id: this.event_id
                }
            });

            this.event_data = await response.data;

            console.log(this.event_data);

            this.loading = false;

            document.title = "Купить билеты на " + this.event_data.title + this.title_text;
        },

        async takeSeance() {
            this.loading = true;

            const response = await axios.get(`${this.api}event_scheme_tilda/`, {
                params: {
                    host_name: this.host,
                    event_id: this.seance_event_id,
                    seance_id:  this.seance_seance_id,
                }
            });

            this.seance_data  = await response.data;

            console.log(this.seance_data);

            document.title = `Купить билеты на "${this.seance_data.map_api_data.name} - ${this.seance_data.hall_name}${this.title_text}`;

            if (this.seance_data.map_api_data.hall) {
                this.hall_map = this.seance_data.map_api_data.hall.hall_map;
                this.list_map = this.seance_data.map_api_data.hall.extended_hall_map
                    || this.seance_data.map_api_data.hall.hall_map;
            }

            if (
                this.seance_data.hallmaps_settings
                && this.seance_data.hallmaps_settings[0]
                && this.seance_data.hallmaps_settings[0][3]
            ) {
                this.map_view = this.seance_data.hallmaps_settings[0][3];
            }

            if (this.hall_map) {
                this.takeScheme();
            } else {
                if (this.seance_data.tickets) {
                    this.placeTickets();
                }

                this.map_view = "list";
                this.show_map_switch = false;
            }

            this.placeList();
        },

        async takeScheme() {
            const response = await axios.get(this.hall_map);

            const content = await response.data;

            document.querySelector("#hall").innerHTML = content;
            this.initScheme();
        },

        initScheme() {
            window.map = L.map('hall', {
                crs: L.CRS.Simple,
                zoom: 1,
                minZoom: 0,
                maxZoom: 4,
                scrollWheelZoom: false,
            });
    
            const innerWidth = (window.innerWidth * .8 ),
                innerHeight = (window.innerHeight - 300);
  
            document.querySelector("#hall").style.height = `${innerHeight + 100}px`;
  
            L.svgOverlay(
                '#hall > svg',
                [[0, 0], [(innerHeight), (innerWidth)]]
            ).addTo(map);
  
            map.fitBounds([[0, 0], [(innerHeight + 50), (innerWidth)]]);
            map.setMaxBounds([[0, 0], [(innerHeight + 50), (innerWidth)]]);
                
            const svg = document.querySelector("body").querySelector("svg"),
                mapPane = document.querySelector("body").querySelector(".leaflet-map-pane");

            document.querySelector("#hall").addEventListener("mousedown", () => {
                svg.style.willChange = "transform";
                mapPane.style.willChange = "transform";
            });

            document.querySelector("#hall").addEventListener("mouseup", () => {
                svg.style.willChange = "unset";
                mapPane.style.willChange = "unset";
            });

            if (this.seance_data.tickets) {
                this.placeTickets();
            }
        },

        placeTickets() {
            if (this.hall_map) {
                this.makeLegend();
            }

            this.seance_data.tickets.forEach((ticket) => {  
                if (ticket.ml) {
                    let m_ticket = ticket,
                        index = this.cart.findIndex(obj => obj.id === m_ticket.id),
                        seat_class = "act m_t",
                        color = "color_1";
          
                    if (index > -1) {
                        m_ticket.count = this.cart[index].count;
                    } else {
                        m_ticket.count = 0;
                    }

                    this.m_tickets.push(ticket);

                    let sector = document.querySelector("body").querySelector(`#hall #${ticket.ss}`);
                        sector_wrp = document.querySelector("body").querySelector(`#hall #${ticket.ss}`);

                    if (sector) {
                        this.setAttributes(sector, {
                            'class': "active_sector",
                            'data-sn': ticket.sn,
                            'data-ss': ticket.ss,
                            'data-p': ticket.p,
                        });

                        let inner_els = sector_wrp.querySelectorAll('path, rect, polygon, polyline, circle');

                        if (ticket.p > this.legend_range[4]) {
                            color = "color_5";
                        } else if (ticket.p > this.legend_range[3]) {
                            color = "color_4";
                        } else if (ticket.p > this.legend_range[2]) {
                            color = "color_3";
                        } else if (ticket.p > this.legend_range[1]) {
                            color = "color_2";
                        } else {
                            color = "color_1"
                        }

                        if (this.cart.findIndex(obj => obj.id === ticket.id) >= 0) {
                            seat_class += " sell";
                        }

                        this.setMultiplyAttributes(inner_els, {
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
                    let place = document.querySelector("body").querySelector(`#hall #${ticket.ss} g:nth-child(${ticket.r}) path:nth-child(${parseInt(ticket.s)})`);
                        seat_class = "act",
                        circle = false,
                        color = "color_1";
                    
                    if (!place) {
                        place = document.querySelector("body").querySelector(`#hall #${ticket.ss} g:nth-child(${ticket.r}) circle:nth-child(${parseInt(ticket.s)})`);
                        circle = true;
                    }

                    if (place) {
                        if (ticket.p > this.legend_range[4]) {
                            color = "color_5";
                        } else if (ticket.p > this.legend_range[3]) {
                            color = "color_4";
                        } else if (ticket.p > this.legend_range[2]) {
                            color = "color_3";
                        } else if (ticket.p > this.legend_range[1]) {
                            color = "color_2";
                        } else {
                            color = "color_1"
                        }

                        if (this.cart.findIndex(obj => obj.id === ticket.id) >= 0) {
                            seat_class += " sell";

                            if (circle) {
                                this.hoveredNumber(
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
    
                        this.setAttributes(place, {
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

            this.addSchemeEvents();            

            this.loading = false;
        },

        addSchemeEvents() {
            const self = this;

            document.querySelector("body")
                .querySelectorAll("path.act, circle.act")
                .forEach(function(el) {
                    el.addEventListener("mouseenter", function(event){                    
                        if (this.dataset.s != -1) {
                            self.hoveredNumber(
                                this.dataset.id,
                                this.dataset.s,
                                this.dataset.c,
                                parseInt(this.getAttribute('cx')),
                                parseInt(this.getAttribute('cy')),
                                this.getAttribute('transform'),
                                this.dataset.color
                            );
        
                            if (this.classList.contains('sell') && document.querySelector(`text[data-text="${this.dataset.id}"]`)) {
                                document.querySelector(`text[data-text="${this.dataset.id}"]`).style.display = "block";
                            }
                        }
                    });
                });
                
            document.querySelector("body")
                .querySelectorAll("path.act:not(.m_t), circle.act:not(.m_t), .list__input")
                .forEach(function(el) {
                    el.addEventListener("click", function(){
                        const id = this.dataset.id,
                            sector = this.dataset.sn,
                            row = this.dataset.r,
                            seat = this.dataset.s,
                            price = this.dataset.p,
                            title = document.querySelector(".seance_top__title").dataset.title,
                            location = document.querySelector(".seance").dataset.location,
                            date = document.querySelector(".date_data").dataset.date,
                            index = self.cart.findIndex(obj => obj.id === id);
        
                        if (index >= 0) {
                            self.cart.splice(index, 1);
                            
                            document.querySelector(`[data-id="${this.dataset.id}"]`).classList.remove("sell");
                        } else {
                            const cartItem = {
                                id: id,
                                sector: sector,
                                row: row,
                                seat: seat,
                                price: price,
                                title: title,
                                location: location,
                                date: date,
                                seance_id: self.seance_seance_id,
                                event_id: self.seance_event_id,
                                count: 1
                            };
        
                            self.cart.push(cartItem);
        
                            if (typeof VK !== 'undefined') {
                                VK.Goal('add_to_cart');
                            }
        
                            if (self.yandex && typeof ym !== 'undefined') {
                                ym(self.yandex, 'reachGoal', 'add_to_card');
                            }
        
                            if (self.mail_ru && typeof _tmr !== 'undefined') {
                                _tmr.push({ type: 'reachGoal', id: self.mail_ru, goal: 'add_to_card'});
                            }

                            document.querySelector(`[data-id="${this.dataset.id}"]`).classList.add("sell");
                        }
        
                        localStorage.setItem("cart", JSON.stringify(self.cart));
        
                        self.touchCart();
                    });
                });

            addEventListener('mousemove', this.tellPos, false);

            document.querySelector("body")
                .querySelectorAll("svg .act, svg .active_sector")
                .forEach(function(el) {
                    el.addEventListener("mouseenter", function(event){
                        if (this.classList.contains("active_sector")) {
                            self.window_is_sector = true;
                            self.window_sector = this.dataset.sn;
                            self.window_price = this.dataset.p;
        
                            this.classList.add('hovered');
                        } else {
                            self.window_is_sector = false;
                            self.window_sector = this.dataset.sn;
                            self.window_row = this.dataset.r;
                            self.window_seat = this.dataset.s;
                            self.window_price = this.dataset.p;
                            
                            document.querySelector(`[data-id="${this.dataset.id}"]`).classList.add("hovered");
                        }
                        
                        self.tellPos(event);
                        
                        document.querySelector(".seance_window").classList.add("active");
                    });
                });

            document.querySelector("body")
                .querySelectorAll("svg .act, svg .active_sector")
                .forEach(function(el) {
                    el.addEventListener("mouseleave", function(event){
                        if (this.classList.contains("active_sector")) {
                            this.classList.remove('hovered');
                        } else {
                            document.querySelector(`[data-id="${this.dataset.id}"]`).classList.remove("hovered");
                        }
                        
                        document.querySelector(".seance_window").classList.remove("active");
                    });
                });

            document.querySelector("body")
                .querySelectorAll(".active_sector")
                .forEach(function(el) {
                    el.addEventListener("click", function(event){
                        if (this.dataset.ss !== undefined) {
                            self.m_sector = this.dataset.ss;
                        } else {
                            self.m_sector = this.querySelector("circle").dataset.ss;
                        }
                    });
                });
        },

        makeLegend() {
            let tickets = this.seance_data.tickets.sort((a,b) => a.p - b.p);
                length = tickets.length
                min_price = tickets[0].p,
                max_price = tickets[length - 1].p;

            this.legend_range[0] = min_price,
            this.legend_range[1] = Math.floor(min_price + ((max_price - min_price) * .1)),
            this.legend_range[2] = Math.floor(min_price + ((max_price - min_price) * .2)),
            this.legend_range[3] = Math.floor(min_price + ((max_price - min_price) * .3)),
            this.legend_range[4] = Math.floor(min_price + ((max_price - min_price) * .4));

            this.$forceUpdate();
        },

        legendToogle(index) {
            const id = index + 1;

            if (!document.querySelector(".legend__el.active")) {
                document.querySelectorAll("#hall .act, .map_place")
                    .forEach(function(el) {
                        el.classList.add("price__off");
                    });
            }

            if (document.querySelector(`.legend__el:nth-child(${id})`).classList.contains("active")) {
                document.querySelectorAll(`#hall .act[data-color=color_${id}]`)
                    .forEach(function(el) {
                        el.classList.add("price__off");
                    });
            } else {
                document.querySelectorAll(`#hall .act[data-color=color_${id}]`)
                    .forEach(function(el) {
                        el.classList.remove("price__off");
                    });
            }

            document.querySelectorAll(`.legend__el:nth-child(${id})`)
                .forEach(function(el) {
                    el.classList.toggle("active");
                });

            if (
                document.querySelectorAll(".legend__el.active").length == 0
                || document.querySelectorAll(".legend__el.active").length == 5
            ) {
                document.querySelectorAll(".legend__el")
                    .forEach(function(el) {
                        el.classList.remove("active");
                    });

                document.querySelectorAll("#hall .act, .map_place")
                    .forEach(function(el) {
                        el.classList.remove("price__off");
                    });
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
            });
        },

        hoveredNumber(id, s, dc, cx, cy, tr, color) {
            if (
                document.querySelector(`#hall[data-text='${id}]`)
                || !s
                || !document.querySelector("#hall circle")
            ) {
                return;
            }
    
            let text = document.createElementNS('http://www.w3.org/2000/svg', 'text'),
                tr_x = 0,
                tr_y = 0,
                left, 
                top, 
                font_size,
                radius = +document.querySelector("#hall circle").getAttribute("r"),
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
                text.setAttribute('data-text', id);
                text.setAttribute('class', "map_place map_place-" + dc);
                text.setAttribute('x', cx + tr_x - left);
                text.setAttribute('y', cy + tr_y + top);
                text.setAttribute('style', 'font-size: ' + font_size + 'px;');
                text.setAttribute('data-color', color);
                text.innerHTML = s;

                let check = document.createElementNS('http://www.w3.org/2000/svg', 'path');

                check.setAttribute('data-path', id);
                check.setAttribute('style', 'stroke-width: 2; fill: #000000; stroke: #000000; opacity: 1; pointer-events: none !important; display: none;');
                check.setAttribute('transform', 'translate('+(cx-3)+', '+(cy-2)+') scale(0.65)');
                check.setAttribute('d', "M10.5793 1.13952L3.7222 7.99666L0.579346 4.8538L1.38506 4.04809L3.7222 6.37952L9.77363 0.333801L10.5793 1.13952Z");

                document.querySelector("#hall svg").appendChild(text);
                document.querySelector("#hall svg").appendChild(check);
            }
        },
        // touchCart() {
        //     this.cart = [];

        //     if (localStorage.getItem("cart")) {
        //         this.cart = JSON.parse(localStorage.getItem("cart"));
        //     }

        //     this.cart_summ = 0;
        //     this.cart_count = 0;

        //     this.cart.forEach((ticket) => {
        //         this.cart_summ += ticket.price * ticket.count;
        //         this.cart_count += ticket.count;
        //     })
        // },
        // clearCart() {
        //     localStorage.setItem("cart", "");

        //     document.querySelectorAll(".sell")
        //         .forEach(function(el) {
        //             el.classList.remove("sell");
        //         });

        //     this.m_tickets.forEach((ticket) => {  
        //         ticket.count = 0;
        //     });

        //     this.m_sector = '';

        //     this.touchCart();
        // },
        tellPos(p) {
            const height = document.querySelector(".seance_window").offsetHeight,
                width = document.querySelector(".seance_window").offsetWidth;

            if (!p.clientX && !p.clientY && window.hoveredEm) {
                const bounds = window.hoveredEm.getBoundingClientRect();

                p.clientX = bounds.x + bounds.width / 2;
                p.clientY = bounds.y + bounds.height / 2;
            }

            document.querySelector(".seance_window").style.left = p.clientX - width / 2;
            document.querySelector(".seance_window").style.top = p.clientY - height - 20;
        },
        delTicket(id) {
            const index = this.cart.findIndex(obj => obj.id === id);

            this.cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(this.cart));

            this.touchCart();
        },
        changeUrl(link) {
            window.location.href = link;
            location.reload();
        },
        makeOrder() {
            let name = document.querySelector('#order_form input[name="name"]').value,
                phone = document.querySelector('#order_form input[name="phone"]').value,
                email = document.querySelector('#order_form input[name="email"]').value,
                comment = document.querySelector('#order_form textarea[name="comment"]').value,
                pay_type = document.querySelector('#order_form input[name="pay_type"]').value,
                agree = document.querySelector('#agree').checked,
                error = false;

            document.querySelectorAll(".error")
                .forEach(function(el) {
                    el.classList.remove("error");
                });

            if (!name) {
                document.querySelector('#order_form input[name="name"]').parentElement.classList.add("error");
                error = true;
            }

            if (!phone) {
                document.querySelector('#order_form input[name="phone"]').parentElement.classList.add("error");
                error = true;
            } 

            if (!email) {
                document.querySelector('#order_form input[name="email"]').parentElement.classList.add("error");
                error = true;
            }

            if (!agree) {
                document.querySelector('#order_form input[name="agree"]').parentElement.classList.add("error");
                error = true;
            }

            if (!error) {
                this.order_loading = true;

                const payment_link = this.tilda_widget_id ? "payment_info" : "payment_tilda";

                axios.post(`${this.api}${payment_link}/send/`, {
                    host_name: this.host,
                    name: name,
                    phone: phone,
                    email: email,
                    comment: comment,
                    pay_type: pay_type,
                    tickets: this.cart,
                },{
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                      }
                }).then((response) => {
                    const resp = response.data;

                    console.log(resp)
                    
                    if (resp.success) {
                        if (this.tilda_widget_id) {
                            let widget = new cp.CloudPayments();

                            widget.pay('auth', {
                                publicId: this.tilda_widget_id,
                                description: this.tilda_widget_deescription,
                                amount: this.cart_summ,
                                currency: 'RUB',
                                invoiceId: resp.order_id,
                                email: email,
                                payer: { 
                                    firstName: name,
                                    phone: phone,
                                },
                                data: {
                                    CloudPayments: {
                                        CustomerReceipt: {
                                            Items: [
                                                {
                                                    label: "Услуга консьерж сервиса по заказу 1",
                                                    quantity: this.cart_count,
                                                    amount: this.cart_summ,
                                                    vat: 0,
                                                }
                                            ],
                                            calculationPlace: this.host,
                                            email: email,
                                            phone: phone,
                                            amounts: {
                                                electronic: this.cart_summ
                                            }
                                        }
                                    }
                                }
                            }, {
                                onSuccess: () => {
                                    setTimeout(() => {
                                        this.clearCart();
                                        window.location.href = "/order_success";
                                    }, 1000);
                                },
                                onFail: () => {
    
                                }
                            });
                        } else {
                           // window.location.href = response.message

                           this.iframe = resp.message

                           this.clearCart();

                           window.scrollTo({top: 0, behavior: 'smooth'});
                        }

                        if (typeof VK !== 'undefined') {
                            VK.Goal('conversion');
                        }

                        if (this.yandex && typeof ym !== 'undefined') {
                            ym(this.yandex, 'reachGoal', 'lead');
                        }

                        if (this.mail_ru && typeof _tmr !== 'undefined') {
                            _tmr.push({ type: 'reachGoal', id: this.mail_ru, goal: 'lead'});
                        }
                    } else {
                        this.sold_modal_ids = resp.tikets_id;
                        this.soldModalShow();

                        this.clearCart();
                    }

                    this.order_loading = false;
                });
            }
        },
        m_ticket(ticket, plus) {
            let id = ticket.id,
                sector = ticket.sn,
                row = ticket.r,
                seat = ticket.s,
                price = ticket.p,
                qty = ticket.qty,
                title = document.querySelector(".seance_top__title").dataset.title,
                location = document.querySelector(".seance").dataset.location,
                date = document.querySelector(".date_data").dataset.date,
                index = this.cart.findIndex(obj => obj.id === id),
                m_index = this.m_tickets.findIndex(obj => obj.id === id),
                sell = true;

            if (index >= 0) {
                let count = this.cart[index].count;

                if (plus) {
                    count += 1;
                    this.cart[index].count = count;
                    this.m_tickets[m_index].count = count;
                } else {
                    if (count == 1) {
                        count = 0;
                        this.cart.splice(index, 1);
                        this.m_tickets[m_index].count = count;

                        sell = false;
                    } else {
                        count -= 1;
                        this.cart[index].count = count;
                        this.m_tickets[m_index].count = count;
                    }
                }
            } else {
                const cartItem = {
                    id: id,
                    sector: sector,
                    row: row,
                    seat: seat,
                    price: price,
                    title: title,
                    location: location,
                    date: date,
                    seance_id: this.seance_seance_id,
                    count: 1,
                    is_multipled: true,
                    qty: qty,
                };

                this.cart.push(cartItem);

                if (typeof VK !== 'undefined') {
                    VK.Goal('add_to_cart');
                }

                if (this.yandex && typeof ym !== 'undefined') {
                    ym(this.yandex, 'reachGoal', 'add_to_cart');
                }

                if (this.mail_ru && typeof _tmr !== 'undefined') {
                    _tmr.push({ type: 'reachGoal', id: this.mail_ru, goal: 'add_to_card'});
                }

                this.m_tickets[m_index].count = 1;
            }

            if (document.querySelector(`[data-id="${id}"]`)) {
                if (sell) {
                    document.querySelector(`[data-id="${id}"]`).classList.add("sell");
                } else {
                    document.querySelector(`[data-id="${id}"]`).classList.remove("sell");
                }
            }

            localStorage.setItem("cart", JSON.stringify(this.cart));

            this.touchCart();
        },
        async takeText() {
            const response = await axios.get(`${this.api}page_tilda/`, {
                params: {
                    host_name: this.host,
                    page_slug: this.text_page
                }
            });

            this.page_content = await response.data[0];

            console.log(this.page_content)

            if (this.text_page == "about") {
                this.page_text = this.page_content.about_text;
            } else if (this.text_page == "guarantee") {
                this.page_text = this.page_content.guarantee_text;
            } else if (this.text_page == "delivery") {
                this.page_text = this.page_content.delivery_text;
            } else if (this.text_page == "offer") {
                this.page_text = this.page_content.offer_text;
            } else if (this.text_page == "payment") {
                this.page_text = this.page_content.payment_text;
            } else if (this.text_page == "confidential") {
                this.page_text = this.page_content.text;
            } else if (this.text_page == "contact") {
                this.page_text = this.page_content.contact_text;
            }
        },
        closeSoldModal() {
            this.sold_modal_staus = false;
        },
        placeList() {
            this.seance_data.tickets.forEach((ticket) => {  
                if (ticket.ml) {
                    this.list_tickets[ticket.ss] = this.list_tickets[ticket.ss] || [];
                    this.list_tickets[ticket.ss].push(ticket);

                    this.list_tickets[ticket.ss]["ml"] = true;

                    this.list_tickets[ticket.ss]["count"] = this.list_tickets[ticket.ss]["count"] + ticket.qty || ticket.qty;
                } else {
                    this.list_tickets[ticket.ss] = this.list_tickets[ticket.ss] || [];
                    this.list_tickets[ticket.ss][ticket.r] = this.list_tickets[ticket.ss][ticket.r] || [];
                    this.list_tickets[ticket.ss][ticket.r].push(ticket);
                    
                    this.list_tickets[ticket.ss]["count"] = this.list_tickets[ticket.ss]["count"] + 1 || 1;

                    this.list_tickets[ticket.ss][ticket.r]["status"] = false;
    
                    if (
                        !this.list_tickets[ticket.ss][ticket.r]["min_price"]
                        || ticket.p < this.list_tickets[ticket.ss][ticket.r]["min_price"]
                    ) {
                        this.list_tickets[ticket.ss][ticket.r]["min_price"] = ticket.p;
                    }
                }

                this.list_tickets[ticket.ss]["title"] = ticket.sn;

                this.list_tickets[ticket.ss]["status"] = false;

                if (
                    !this.list_tickets[ticket.ss]["min_price"]
                    || ticket.p < this.list_tickets[ticket.ss]["min_price"]
                ) {
                    this.list_tickets[ticket.ss]["min_price"] = ticket.p;
                }

                if (
                    !this.list_tickets[ticket.ss]["max_price"]
                    || ticket.p > this.list_tickets[ticket.ss]["max_price"]
                ) {
                    this.list_tickets[ticket.ss]["max_price"] = ticket.p;
                }
            });

            console.log(this.list_tickets)

            for (const property in this.list_tickets) {
                for (const row in this.list_tickets[property]) {
                    if (
                        !this.list_tickets[property]["ml"]
                        && typeof this.list_tickets[property][row] === 'object'
                    ) {
                        this.list_tickets[property][row].sort((a, b) => a.p - b.p || a.s - b.s);
                    }
                }
            }
        },
        soldModalShow() {
            this.sold_modal_ids.forEach((id) => { 
                this.cart.forEach((ticket) => { 
                    if (id == ticket.id) {
                        this.sold_modal_tickets.push(ticket.sector + ", ряд " + ticket.row + ", место " + ticket.seat);

                        this.sold_modal_link = "/seance#" + ticket.event_id + "&" + ticket.seance_id;
                    }
                });
            });

            this.sold_modal_staus = true;
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
});