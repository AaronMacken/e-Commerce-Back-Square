exports.getFinalArr = (arr1, arr2) => {
    let finalArr = [];
    for (let i = 0; i < arr1.length; i++) {
        for (let j = 0; j < arr2.length; j++) {
            if (arr1[i].id == arr2[j]._id) {
                finalArr.push({
                    id: arr1[i].id,
                    title: arr2[j].title,
                    qty: arr1[i].qty,
                    price: arr2[j].price
                })
                break;
            }
        }
    }
    return finalArr
}

// JS Sets

