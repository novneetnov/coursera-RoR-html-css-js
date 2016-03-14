$(function () { // Same as document.addEventListener("DOMContentLoaded")...
	
	// Same as document.querySelector("#navbarToggle").addEventListener("blur", function...)	
	$("#navbarToggle").blur(function(event) {
		var screewidth = window.innerWidth;
		if (screewidth < 768) {
			$("#collapsable-nav").collapse("hide");
		}
	});
});

(function (global) {

	var dc = {};

	// All URLs
	var homeHtml = "snippets/home-snippet.html";
	var allCategoriesUrl = "http://davids-restaurant.herokuapp.com/categories.json";
	var categoriesTitleHtml = "snippets/categories-title-snippet.html";
	var categoryHtml = "snippets/category-snippet.html";
	var menuItemsUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
	var menuItemsTitleHtml = "snippets/menu-items-title.html";
	var menuItemHtml = "snippets/menu-item.html";
	//var allCatShortNames = ['A', 'B', 'C', 'CM', 'CSR', 'CU', 'D', 'DK', 'DS', 'F', 'FR', 'FY', 'L', 'NF', 'NL', 'NS', 'PF', 'SO', 'SP', 'SR', 'SS', 'T', 'V', 'VG']
	
	// Helper function for inserting innerHTML
	var insertHtml = function(selector, html) {
		var targetElem = document.querySelector(selector);
		targetElem.innerHTML = html;
	};

	// Show loading icon inside element identified by 'selector'
	var showLoading = function(selector) {
		var html = "<div class='text-center'>"
		html += "<img src='images/ajax-loader.gif'></div>"
		insertHtml(selector, html);
	};

	// Return with substitute of {{propName}} with propValue in the given 'string'
	var insertProperty = function (string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToReplace, "g"), propValue);
		return string;
	};

	// Remove the class 'active' from Home and switch to Menu button
	var switchMenuToActive = function () {
		// Remove 'active' from home button
		$("#navHomeButton").removeClass("active");

		// Apply 'active' class to menu button if not already there
		$("#navMenuButton").addClass("active");
	};

	// On page load (before images or CSS)
	document.addEventListener("DOMContentLoaded", function(event) {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(homeHtml, function(responseText){
			document.querySelector("#main-content").innerHTML = responseText;
		}, 
		false);
	});

	// Load the menu categories view
	dc.loadMenuCategories = function() {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
	};

	
	function buildAndShowCategoriesHTML (categories) {
		// Load title snippet of categories page
		$ajaxUtils.sendGetRequest(
			categoriesTitleHtml, 
			function (categoriesTitleHtml) {
				//Retrive the single category snipper
				$ajaxUtils.sendGetRequest(categoryHtml, 
					function (categoryHtml) {
						switchMenuToActive();
						var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
						insertHtml("#main-content", categoriesViewHtml);	
					}, false);
			}, false);
	}

	// Using categories data and snippets html build categories view HTML to be inserted into page.
	function buildCategoriesViewHtml (categories, categoriesTitleHtml, categoryHtml) {
		var finalHtml = categoriesTitleHtml;
		finalHtml += "<section class='row'>";
		
		// Loop over all categories
		for (var i = 0; i < categories.length; i++)	{
			// Insert category values
			var html = categoryHtml;
			var name = "" + categories[i].name;
			var short_name = "" + categories[i].short_name;
			html = insertProperty(html, "name", name);
			html = insertProperty(html, "short_name", short_name);
			finalHtml += html;
		}
		finalHtml += "</section>";
		
		return finalHtml;
	}
	
	// Load the menu items view
	dc.loadMenuItems = function(categoryShort) {
		showLoading("#main-content");
		if (categoryShort == '{{randomCategoryShortName}}') {
			$ajaxUtils.sendGetRequest(allCategoriesUrl, function(categories) {
				categoryShort = categories[Math.floor(Math.random() * categories.length)].short_name;
				$ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
			});
		} else {
			$ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
		}
	};

	function buildAndShowMenuItemsHTML (categoryMenuItems) {
		// Load title snippet of menu items page
		$ajaxUtils.sendGetRequest(menuItemsTitleHtml, 
			function (menuItemsTitleHtml) {
				// Retrieve single menu item snippet
				$ajaxUtils.sendGetRequest(menuItemHtml, 
					function (menuItemHtml) {
						switchMenuToActive();
						var menuItemsViewHtml = 
							buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
						insertHtml("#main-content", menuItemsViewHtml);
					}, false);		
			}, false);
	}

	function buildMenuItemsViewHtml (categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

		var finalHtml = menuItemsTitleHtml;
		finalHtml += "<section class='row'>";

		// Loop over menu_items
		var menuItems = categoryMenuItems.menu_items;
		var catShortName = categoryMenuItems.category.short_name;
		for (var i = 0; i < menuItems.length; i++) {
			// Insert menu item values
			var html = menuItemHtml;
			html = insertProperty(html, "short_name", menuItems[i].short_name); 
			html = insertProperty(html, "catShortName", catShortName);
			html = insertItemPrice(html, "price_small", menuItems[i].price_small);
			html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
			html = insertItemPrice(html, "price_large", menuItems[i].price_large);
			html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
			html = insertProperty(html, "name", menuItems[i].name); 
			html = insertProperty(html, "description", menuItems[i].description);

			// Add clearfix after every second menu item
			if (i % 2 != 0) {
				html += "<div class='clearfix visible-md-block visible-lg-block'></div>";
			}

			finalHtml += html;
		}	

		finalHtml += "</section>";
		return finalHtml;
	}

	// Appends price with '$' if price exists
	function insertItemPrice (html, pricePropName, priceValue) {
		// If not specified replace with ""
		if (!priceValue) {
			return insertProperty(html, pricePropName, "");
		}

		priceValue = "$" + priceValue.toFixed(2);
		html = insertProperty(html, pricePropName, priceValue);
		return html;
	}

	// Appends portion name in parens if it exists
	function insertItemPortionName(html, portionName, portionValue) {
		// If not specified return original string
		if (!portionValue) {
			return insertProperty(html, portionName, "");
		}

		portionValue = "(" + portionValue + ")";
		html = insertProperty(html, portionName, portionValue);
		return html
	}

	global.$dc = dc;
})(window);









