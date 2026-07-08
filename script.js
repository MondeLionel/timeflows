            const countDownDate = new Date("July 29, 2026 00:00:00").getTime();

            const x = setInterval(function() {
                const now = new Date().getTime();
                const distance = countDownDate - now;

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
                document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
                document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
                document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');

                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("countdown").innerHTML = "<div class='col-12 text-center text-accent-green fs-4'>We have launched!</div>";
                }
            }, 1000);
            document.getElementById('notifyForm').addEventListener('submit', function(e) {
                e.preventDefault();

                const form = this;
                const submitBtn = form.querySelector('button[type="submit"]');
                const emailInput = form.querySelector('input[type="email"]');
                const phoneInput = form.querySelector('input[type="tel"]');

                const toastElement = document.getElementById('statusToast');
                const toastMessage = document.getElementById('toastMessage');
                const toast = new bootstrap.Toast(toastElement, { delay: 4000 });

                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Verifying...';


                grecaptcha.ready(function() {

                    grecaptcha.execute('6LdTOkotAAAAAE59Fghhc6gW3FZfNxNm0UQpoesG', {action: 'submit'}).then(function(token) {

                        const formData = new URLSearchParams();
                        formData.append('email', emailInput.value);
                        formData.append('phone', phoneInput.value);
            formData.append('recaptchaToken', token); // The invisible token

            const scriptURL = 'https://script.google.com/macros/s/AKfycbw_w07lYM97HzKXs0RfhZ05vC22AemjLJaui4jt5n4yUgC87ywlB3h2NGE2dNmr1v3qZA/exec';

            submitBtn.innerHTML = 'Adding to list...';


            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            })
            .then(response => {
                return response.text().then(text => {
                    return {
                        ok: response.ok,
                        status: response.status,
                        text: text
                    };
                });
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP Error ${res.status}: ${res.text}`);
                }

                if (!res.text || res.text.trim() === '') {
                    throw new Error('Google script responded with an empty payload.');
                }

                try {

                    const data = JSON.parse(res.text);
                    if (data.result === 'success') {
                        toastMessage.textContent = 'Thank you! You have been added to the waitlist.';
                        toastElement.className = 'toast align-items-center border-0 bg-accent-green'; 
                        toast.show();
                        form.reset();
                    } else {
                        throw new Error(data.message || 'The server rejected your submission.');
                    }
                } catch (jsonError) {

                    if (res.text.trim() === 'Success') {
                        toastMessage.textContent = 'Thank you! You have been added to the waitlist.';
                        toastElement.className = 'toast align-items-center border-0 bg-accent-green'; 
                        toast.show();
                        form.reset();
                    } else {

                        throw new Error(res.text);
                    }
                }

            });
        });
    });