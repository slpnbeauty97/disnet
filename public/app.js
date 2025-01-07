document.getElementById('checkout-button').addEventListener('click', () => {
    fetch('/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.id) {
                window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.id}`;
            } else {
                alert('Something went wrong!');
            }
        })
        .catch((err) => console.error(err));
});
