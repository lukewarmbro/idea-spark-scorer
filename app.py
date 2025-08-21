import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash
from forms import IdeaValidationForm
from openai_service import validate_business_idea

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

@app.route('/', methods=['GET', 'POST'])
def index():
    form = IdeaValidationForm()
    
    if form.validate_on_submit():
        business_idea = form.business_idea.data.strip()
        
        try:
            # Validate the business idea using OpenAI
            validation_result = validate_business_idea(business_idea)
            
            return render_template('results.html', 
                                 idea=business_idea,
                                 result=validation_result)
                                 
        except Exception as e:
            logging.error(f"Error validating business idea: {str(e)}")
            flash('Sorry, there was an error processing your request. Please try again.', 'error')
            return render_template('index.html', form=form)
    
    return render_template('index.html', form=form)

@app.route('/new')
def new_validation():
    """Route to start a new validation"""
    return redirect(url_for('index'))

@app.errorhandler(404)
def not_found_error(error):
    return render_template('index.html', form=IdeaValidationForm()), 404

@app.errorhandler(500)
def internal_error(error):
    flash('An internal error occurred. Please try again.', 'error')
    return render_template('index.html', form=IdeaValidationForm()), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
