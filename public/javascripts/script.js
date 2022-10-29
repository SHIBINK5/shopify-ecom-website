
function addToCart(ProId){
    $.ajax({
        url:'/add-to-cart/'+ProId,
        method:'get',
        success:(response)=>{
            if(response.status){
                Swal.fire({
                    icon:'success',
                    title:'Added to Cart',
                    showConfirmButton: false,
                    timer:1500
                })
                $("#mydiv").load(location.href + " #mydiv");
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
        }
    })
}


// function addToWishlist(ProId){
//     $.ajax({
//         url:'/add-to-wishlist/'+ProId,
//         method:'get',
//         success:(response)=>{
//             if(response.response.status){
//                 alert("Added to wishlist")
//                 // count=parseInt(count)+1
//                 // $("#wish-count").html(count)
//             }else{
//                 alert('failed')
//             }
//         }
//     })
// }


// function addtowishlist(proId){
//     $.ajax({
//         url: '/add-to-wishlist/' + proId,
//         method: 'get',
//         success: (response) =>  {
//             if(response.response.status){
                
//                 $("#wish-count").load(location.href + " #wish-count");
//                 Swal.fire({
//                         icon:'success',
//                         title:'Added to Wishlist',
//                         showConfirmButton: false,
//                         timer:1500
//                     })
//             }else{
//                 $("#wish-count").load(location.href + " #wish-count");
//                 Swal.fire({
//                         icon:'success',
//                         title:'Removed from Wishlist',
//                         showConfirmButton: false,
//                         timer:1500
//                     })
//             }
//         }
//     })
// }


// function addtowishlist(proId){
//     $.ajax({
//         url: '/add-to-wishlist/' + proId,
//         method: 'get',
//         success: (response) =>  {
//             if(response.response.status){
                
//                 //$("#wish-count").load(location.href + " #wish-count");
//                 alert('Added')
//             }else{
//                // $("#wish-count").load(location.href + " #wish-count");
//                alert('failed')
//             }
//         }
//     })
// }