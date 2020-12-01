
var checkoutTabId = null

chrome.browserAction.onClicked.addListener(async function(tab) {

  const currentTab = await getCurrentTab({active: true, currentWindow:true})
  checkoutTabId = currentTab[0].id
  
  const response = await sendMessage(checkoutTabId, {type: 'get-page-links'})
  const productLinks = filterProductLinks(response.links)
  const productIds = parseProductLinks(productLinks)
	showProductsCheckout(productIds)

})

function filterProductLinks(pageLinks) {
  let productLinks = []
  if (pageLinks === {}) { return productLinks }

  Object.keys(pageLinks).forEach(function(key) {
    const link = pageLinks[key]

    if (validURL(link.target, stream=true)) {
      productLinks.push(link.target)
    }
  })

  return productLinks
}

function parseProductLinks(productLinks) {
  let productIds = []
  
	productLinks.forEach(link => {
		const target = link.split('?')[0]
    const parts = target.split('/')
    
		productIds.push({
			uid: parts[parts.length - 2],
			pid: parts[parts.length - 1]
    })
    
  })
  
	return productIds
}

async function showProductsCheckout(productIds) {

  let products = {}

  for (var i=0; i < productIds.length; i++) {

    const ref = database.ref(`links/${productIds[i].uid}`)
    const snapshot = await ref.orderByChild("product_id")
                        .equalTo(productIds[i].pid)
                        .once('value')
    const data = snapshot.val()

    if (data) {
      const key = Object.keys(data)[0]
      const obj = data[key]
      products[key] = obj
    }

  }

  if (Object.keys(products).length !== 0) {

    await sendMessage(checkoutTabId, {
      type: 'checkout-products',
      products: products
    })
  
    await sendMessage(
      checkoutTabId,
      {type: 'clicked-browser-action'}
    )
  }
  
}

function validURL(str, stream=false) {

	if (str === undefined || str === null) {
		return false
	}

  if (stream) {
    if (!str.includes('genie24.ca')) {
      return false
    }
	}
	
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-zA-Z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if (!!pattern.test(str)) {
    return true
  }

  if (str.startsWith('http') || str.startsWith('https')) {
    var domain = str.split('/')[2]
    return !!pattern.test(domain)
  }

  return false
}