document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref');
    const refField = document.getElementById('referrerName');

    if (referrer) {
        refField.value = referrer;
        refField.style.backgroundColor = "#e9ecef"; // Gray out
        refField.readOnly = true; 
    } else {
        // If no referrer, you can either block them or set a default
        alert("A referral link is required to join TechGeo.");
        document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Please join using a valid TechGeo referral link.</h2>";
    }
});