export default function aiToolValidation(values) {
  let errors = {}

  // Name validation
  if (!values.name) {
    errors.name = "Tool name is required"
  } else if (values.name.length < 2) {
    errors.name = "Tool name must be at least 2 characters"
  } else if (values.name.length > 50) {
    errors.name = "Tool name must be less than 50 characters"
  }

  // Tagline validation
  if (!values.tagline) {
    errors.tagline = "Tagline is required"
  } else if (values.tagline.length < 10) {
    errors.tagline = "Tagline must be at least 10 characters"
  } else if (values.tagline.length > 100) {
    errors.tagline = "Tagline must be less than 100 characters"
  }

  // Description validation
  if (!values.description) {
    errors.description = "Description is required"
  } else if (values.description.length < 50) {
    errors.description = "Description must be at least 50 characters"
  } else if (values.description.length > 2000) {
    errors.description = "Description must be less than 2000 characters"
  }

  // Website URL validation
  if (!values.website_url) {
    errors.website_url = "Website URL is required"
  } else if (!/^(https?):\/\/[^\s/$.?#].[^\s]*$/i.test(values.website_url)) {
    errors.website_url = "Please enter a valid URL (e.g., https://example.com)"
  }

  // Category validation
  if (!values.category) {
    errors.category = "Please select a category"
  }

  // Tags validation (optional but if provided, must be valid)
  if (values.tags) {
    const tagArray = values.tags.split(",").map(tag => tag.trim()).filter(Boolean)
    if (tagArray.length > 10) {
      errors.tags = "Maximum 10 tags allowed"
    }
    const invalidTag = tagArray.find(tag => tag.length > 20)
    if (invalidTag) {
      errors.tags = "Each tag must be less than 20 characters"
    }
  }

  // Email validation (optional but if provided, must be valid)
  if (values.submitter_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.submitter_email)) {
    errors.submitter_email = "Please enter a valid email address"
  }

  return errors
}
