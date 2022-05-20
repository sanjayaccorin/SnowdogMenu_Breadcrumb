/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

 define([
  'jquery',
  'Magento_Theme/js/model/breadcrumb-list'
], function ($, breadcrumbList) {
  'use strict';

  return function (widget) {

      $.widget('mage.breadcrumbs', widget, {
          options: {
              categoryUrlSuffix: '',
              useCategoryPathInUrl: false,
              product: '',
              categoryItemSelector: '.main-nav__inner-item',
              menuContainer: '.nav-sections-item-content > nav > ul'
          },

          /** @inheritdoc */
          _render: function () {
            this._appendCount();
            this._appendCatalogCrumbs();
            this._super();
          },

          /**
           * Append category and product crumbs.
           *
           * @private
           */
           _appendCount: function () {
                $('.main-nav__list > li').each(function () {
                    var mainAttrID = $(this).attr('attr-id');
                    $('.main-nav .main-nav__inner-item--level1 > .main-nav__inner-link').attr('href', '#');
                    var counterDiv = $(this).find('.main-nav__inner-list--level2').find('.main-nav__inner-item').not(".main-nav__inner-item--all");
                    $(counterDiv).each(function(i) {
                        $(this).addClass(mainAttrID + '-' + (i + 1));
                    });
                });
            },

          /**
           * Append category and product crumbs.
           *
           * @private
           */
          _appendCatalogCrumbs: function () {
              var categoryCrumbs = this._resolveCategoryCrumbs();

              categoryCrumbs.forEach(function (crumbInfo) {
                  breadcrumbList.push(crumbInfo);
              });

              if (this.options.product) {
                  breadcrumbList.push(this._getProductCrumb());
              }
          },

          /**
           * Resolve categories crumbs.
           *
           * @return Array
           * @private
           */
          _resolveCategoryCrumbs: function () {
              var menuItem = this._resolveCategoryMenuItem(),
                  categoryCrumbs = [];

              if (menuItem !== null && menuItem.length) {
                  categoryCrumbs.unshift(this._getCategoryCrumb(menuItem));

                  while ((menuItem = this._getParentMenuItem(menuItem)) !== null) {
                      categoryCrumbs.unshift(this._getCategoryCrumb(menuItem));
                  }
              }

              return categoryCrumbs;
          },

          /**
           * Returns crumb data.
           *
           * @param {Object} menuItem
           * @return {Object}
           * @private
           */
          _getCategoryCrumb: function (menuItem) {
              var text = menuItem.text().replace('All', '');;
              return {
                'name': 'category',
                'label': text,
                'link': menuItem.attr('href'),
                'title': ''
              };
          },

          /**
           * Returns product crumb.
           *
           * @return {Object}
           * @private
           */
          _getProductCrumb: function () {
              return {
                  'name': 'product',
                  'label': this.options.product,
                  'link': '',
                  'title': ''
              };
          },

          /**
           * Find parent menu item for current.
           *
           * @param {Object} menuItem
           * @return {Object|null}
           * @private
           */
          _getParentMenuItem: function (menuItem) {
              var classes,
                  classNav,
                  parentClass,
                  parentMenuItem = null;

              if (!menuItem) {
                  return null;
              }

              classes = menuItem.parent().attr('class');
              classNav = classes.match(/(nav\-)[0-9]+(\-[0-9]+)+/gi);

              if (classNav) {
                  classNav = classNav[0];
                  parentClass = classNav.substr(0, classNav.lastIndexOf('-'));

                  if (parentClass.lastIndexOf('-') !== -1) {
                      parentMenuItem = $(this.options.menuContainer).find('.' + parentClass + ' > a');
                      parentMenuItem = parentMenuItem.length ? parentMenuItem : null;
                  }
              }

              return parentMenuItem;
          },

          /**
           * Returns category menu item.
           *
           * Tries to resolve category from url or from referrer as fallback and
           * find menu item from navigation menu by category url.
           *
           * @return {Object|null}
           * @private
           */
          _resolveCategoryMenuItem: function () {
              var categoryUrl = this._resolveCategoryUrl(),
                  menu = $(this.options.menuContainer),
                  categoryMenuItem = null;

              if (categoryUrl && menu.length) {
                  categoryMenuItem = menu.find(
                      this.options.categoryItemSelector +
                      ' > a[href="' + categoryUrl + '"]'
                  );
              }

              return categoryMenuItem;
          },

          /**
           * Returns category url.
           *
           * @return {String}
           * @private
           */
          _resolveCategoryUrl: function () {
              var categoryUrl;
              var replaceCategoryUrl;

              if (this.options.useCategoryPathInUrl) {
                  // In case category path is used in product url - resolve category url from current url.
                  categoryUrl = window.location.href.split('?')[0];
                  categoryUrl = categoryUrl.substring(0, categoryUrl.lastIndexOf('/')) +
                      this.options.categoryUrlSuffix;
                  if (categoryUrl) {
                    console.log(BASE_URL);
                    replaceCategoryUrl = categoryUrl.replace(BASE_URL,"/");
                  }
              } else {
                  // In other case - try to resolve it from referrer (without parameters).
                  categoryUrl = document.referrer;

                  if (categoryUrl.indexOf('?') > 0) {
                      categoryUrl = categoryUrl.substr(0, categoryUrl.indexOf('?'));
                  }
                  if (categoryUrl) {
                    console.log(BASE_URL);
                    replaceCategoryUrl = categoryUrl.replace(BASE_URL,"/");
                  }
              }

              return replaceCategoryUrl;
          }
      });

      return $.mage.breadcrumbs;
  };
});
